import { z } from 'zod';
import { insertUserSchema, insertStudentSchema, insertAttendanceSchema, insertExamSchema, users, students, attendance, exams } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/auth/login',
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    register: {
      method: 'POST' as const,
      path: '/api/auth/register',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout',
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: z.null(), // Not logged in
      },
    },
  },
  students: {
    list: {
      method: 'GET' as const,
      path: '/api/students',
      responses: {
        200: z.array(z.custom<typeof students.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/students',
      input: insertStudentSchema.omit({ teacherId: true }),
      responses: {
        201: z.custom<typeof students.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/students/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  attendance: {
    get: {
      method: 'GET' as const,
      path: '/api/attendance',
      input: z.object({
        date: z.string().optional(),
        month: z.string().optional(), // YYYY-MM
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof attendance.$inferSelect>()),
      },
    },
    mark: {
      method: 'POST' as const,
      path: '/api/attendance/batch',
      input: z.object({
        date: z.string(),
        records: z.array(z.object({
          studentId: z.number(),
          present: z.boolean(),
        })),
      }),
      responses: {
        200: z.array(z.custom<typeof attendance.$inferSelect>()),
      },
    },
  },
  exams: {
    list: {
      method: 'GET' as const,
      path: '/api/exams',
      responses: {
        200: z.array(z.custom<typeof exams.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/exams',
      input: insertExamSchema.omit({ teacherId: true }),
      responses: {
        201: z.custom<typeof exams.$inferSelect>(),
      },
    },
  },
  analytics: {
    get: {
      method: 'GET' as const,
      path: '/api/analytics',
      responses: {
        200: z.object({
          totalStudents: z.number(),
          averageAttendance: z.number(),
          averageScore: z.number(),
          attendanceTrend: z.array(z.object({
            date: z.string(),
            presentCount: z.number(),
            absentCount: z.number(),
          })),
          performanceDistribution: z.array(z.object({
            range: z.string(),
            count: z.number(),
          })),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
