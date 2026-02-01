import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(), // Acts as the login handle
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  classCode: text("class_code").notNull(),
  teacherUniqueId: text("teacher_unique_id").notNull(),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  rollNumber: text("roll_number"),
  teacherId: integer("teacher_id").notNull(), // Links student to a specific teacher/class
  active: boolean("active").default(true),
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  date: date("date").notNull(), // YYYY-MM-DD
  present: boolean("present").notNull(), // true = present, false = absent
  teacherId: integer("teacher_id").notNull(),
});

export const exams = pgTable("exams", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  subject: text("subject").notNull(),
  score: integer("score").notNull(),
  maxScore: integer("max_score").notNull(),
  examDate: date("exam_date").notNull(),
  teacherId: integer("teacher_id").notNull(),
});

// === RELATIONS ===

export const usersRelations = relations(users, ({ many }) => ({
  students: many(students),
  attendance: many(attendance),
  exams: many(exams),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  teacher: one(users, {
    fields: [students.teacherId],
    references: [users.id],
  }),
  attendance: many(attendance),
  exams: many(exams),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(students, {
    fields: [attendance.studentId],
    references: [students.id],
  }),
  teacher: one(users, {
    fields: [attendance.teacherId],
    references: [users.id],
  }),
}));

export const examsRelations = relations(exams, ({ one }) => ({
  student: one(students, {
    fields: [exams.studentId],
    references: [students.id],
  }),
  teacher: one(users, {
    fields: [exams.teacherId],
    references: [users.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, isAdmin: true });
export const insertStudentSchema = createInsertSchema(students).omit({ id: true, active: true });
export const insertAttendanceSchema = createInsertSchema(attendance).omit({ id: true });
export const insertExamSchema = createInsertSchema(exams).omit({ id: true });

// === EXPLICIT API CONTRACT TYPES ===

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;

export type AttendanceRecord = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;

export type ExamRecord = typeof exams.$inferSelect;
export type InsertExam = z.infer<typeof insertExamSchema>;

// API Payloads
export type CreateStudentRequest = Omit<InsertStudent, "teacherId">;
export type MarkAttendanceRequest = {
  date: string;
  records: { studentId: number; present: boolean }[];
};
export type CreateExamRequest = Omit<InsertExam, "teacherId">;

// Analytics Types
export type ClassAnalytics = {
  totalStudents: number;
  averageAttendance: number;
  averageScore: number;
  attendanceTrend: { date: string; presentCount: number; absentCount: number }[];
  performanceDistribution: { range: string; count: number }[]; // e.g., "0-50", "51-80", "81-100"
};
