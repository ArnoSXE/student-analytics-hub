import { db } from "./db";
import {
  users, students, attendance, exams,
  type User, type InsertUser, type InsertStudent, type Student,
  type AttendanceRecord, type InsertAttendance,
  type ExamRecord, type InsertExam,
  type ClassAnalytics
} from "@shared/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Auth
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Students
  getStudents(teacherId: number): Promise<Student[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  deleteStudent(id: number): Promise<void>;

  // Attendance
  getAttendance(teacherId: number, date?: string, month?: string): Promise<AttendanceRecord[]>;
  markAttendance(records: InsertAttendance[]): Promise<AttendanceRecord[]>;

  // Exams
  getExams(teacherId: number): Promise<ExamRecord[]>;
  createExam(exam: InsertExam): Promise<ExamRecord>;

  // Analytics
  getAnalytics(teacherId: number): Promise<ClassAnalytics>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // Auth
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Students
  async getStudents(teacherId: number): Promise<Student[]> {
    return await db.select().from(students).where(and(eq(students.teacherId, teacherId), eq(students.active, true)));
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const [newStudent] = await db.insert(students).values(student).returning();
    return newStudent;
  }

  async deleteStudent(id: number): Promise<void> {
    await db.update(students).set({ active: false }).where(eq(students.id, id));
  }

  // Attendance
  async getAttendance(teacherId: number, date?: string, month?: string): Promise<AttendanceRecord[]> {
    let query = db.select().from(attendance).where(eq(attendance.teacherId, teacherId));

    if (date) {
      query = db.select().from(attendance).where(and(eq(attendance.teacherId, teacherId), eq(attendance.date, date)));
    } else if (month) {
      // Assuming month is YYYY-MM
      const startOfMonth = `${month}-01`;
      // Calculate end of month simply or just query by string prefix matching if supported, but date range is safer
      // Simplification: just filtering by string comparison for YYYY-MM
      // Postgres date to string cast needed or use date functions
      // Using explicit date range for safety
      const nextMonthDate = new Date(`${month}-01`);
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
      const endOfMonth = nextMonthDate.toISOString().split('T')[0];

      query = db.select().from(attendance).where(
        and(
          eq(attendance.teacherId, teacherId),
          gte(attendance.date, startOfMonth),
          sql`${attendance.date} < ${endOfMonth}`
        )
      );
    }

    return await query;
  }

  async markAttendance(records: InsertAttendance[]): Promise<AttendanceRecord[]> {
    // Upsert logic: if studentId + date exists, update present status
    const results: AttendanceRecord[] = [];
    for (const record of records) {
      // Check existing
      const [existing] = await db.select().from(attendance).where(
        and(
          eq(attendance.studentId, record.studentId),
          eq(attendance.date, record.date)
        )
      );

      if (existing) {
        const [updated] = await db.update(attendance)
          .set({ present: record.present })
          .where(eq(attendance.id, existing.id))
          .returning();
        results.push(updated);
      } else {
        const [inserted] = await db.insert(attendance).values(record).returning();
        results.push(inserted);
      }
    }
    return results;
  }

  // Exams
  async getExams(teacherId: number): Promise<ExamRecord[]> {
    return await db.select().from(exams).where(eq(exams.teacherId, teacherId));
  }

  async createExam(exam: InsertExam): Promise<ExamRecord> {
    const [newExam] = await db.insert(exams).values(exam).returning();
    return newExam;
  }

  // Analytics
  async getAnalytics(teacherId: number): Promise<ClassAnalytics> {
    const studentsList = await this.getStudents(teacherId);
    const totalStudents = studentsList.length;

    if (totalStudents === 0) {
      return {
        totalStudents: 0,
        averageAttendance: 0,
        averageScore: 0,
        attendanceTrend: [],
        performanceDistribution: [],
      };
    }

    // Average Attendance
    const allAttendance = await db.select().from(attendance).where(eq(attendance.teacherId, teacherId));
    const presentCount = allAttendance.filter(a => a.present).length;
    const averageAttendance = allAttendance.length > 0 ? (presentCount / allAttendance.length) * 100 : 0;

    // Attendance Trend (Last 7 active days)
    // Group by date
    const trendMap = new Map<string, { present: number, absent: number }>();
    allAttendance.forEach(a => {
      const d = a.date.toString(); // Ensure string YYYY-MM-DD
      if (!trendMap.has(d)) trendMap.set(d, { present: 0, absent: 0 });
      if (a.present) trendMap.get(d)!.present++;
      else trendMap.get(d)!.absent++;
    });

    // Convert map to array and sort
    const attendanceTrend = Array.from(trendMap.entries())
      .map(([date, counts]) => ({ date, presentCount: counts.present, absentCount: counts.absent }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // Last 7 records

    // Average Score
    const allExams = await this.getExams(teacherId);
    const totalScorePercentage = allExams.reduce((acc, curr) => acc + (curr.score / curr.maxScore * 100), 0);
    const averageScore = allExams.length > 0 ? totalScorePercentage / allExams.length : 0;

    // Performance Distribution
    const distribution = { "0-50": 0, "51-70": 0, "71-90": 0, "91-100": 0 };
    allExams.forEach(e => {
      const pct = (e.score / e.maxScore) * 100;
      if (pct <= 50) distribution["0-50"]++;
      else if (pct <= 70) distribution["51-70"]++;
      else if (pct <= 90) distribution["71-90"]++;
      else distribution["91-100"]++;
    });

    const performanceDistribution = Object.entries(distribution).map(([range, count]) => ({ range, count }));

    return {
      totalStudents,
      averageAttendance: Math.round(averageAttendance),
      averageScore: Math.round(averageScore),
      attendanceTrend,
      performanceDistribution,
    };
  }
}

export const storage = new DatabaseStorage();
