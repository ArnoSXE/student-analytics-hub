import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth"; // Will create this helper file for cleanliness
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Passport Auth
  setupAuth(app);

  // === API Routes ===

  // Middleware to check auth
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Students
  app.get(api.students.list.path, requireAuth, async (req, res) => {
    const students = await storage.getStudents(req.user!.id);
    res.json(students);
  });

  app.post(api.students.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.students.create.input.parse(req.body);
      const student = await storage.createStudent({ ...input, teacherId: req.user!.id });
      res.status(201).json(student);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
        return;
      }
      throw err;
    }
  });

  app.delete(api.students.delete.path, requireAuth, async (req, res) => {
    await storage.deleteStudent(Number(req.params.id));
    res.status(204).send();
  });

  // Attendance
  app.get(api.attendance.get.path, requireAuth, async (req, res) => {
    const { date, month } = req.query as { date?: string; month?: string };
    const records = await storage.getAttendance(req.user!.id, date, month);
    res.json(records);
  });

  app.post(api.attendance.mark.path, requireAuth, async (req, res) => {
    try {
      const input = api.attendance.mark.input.parse(req.body);
      const recordsToInsert = input.records.map(r => ({
        studentId: r.studentId,
        date: input.date,
        present: r.present,
        teacherId: req.user!.id,
      }));
      const results = await storage.markAttendance(recordsToInsert);
      res.json(results);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
        return;
      }
      throw err;
    }
  });

  // Exams
  app.get(api.exams.list.path, requireAuth, async (req, res) => {
    const exams = await storage.getExams(req.user!.id);
    res.json(exams);
  });

  app.post(api.exams.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.exams.create.input.parse(req.body);
      const exam = await storage.createExam({ ...input, teacherId: req.user!.id });
      res.status(201).json(exam);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
        return;
      }
      throw err;
    }
  });

  // Analytics
  app.get(api.analytics.get.path, requireAuth, async (req, res) => {
    const stats = await storage.getAnalytics(req.user!.id);
    res.json(stats);
  });

  return httpServer;
}
