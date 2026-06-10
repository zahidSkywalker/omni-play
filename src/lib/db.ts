// Stub - Prisma DB (requires @prisma/client + prisma generate)
export const db = {
  exam: { findMany: async () => [], findUnique: async () => null, create: async (d: any) => d.data, update: async (d: any) => d.data, delete: async () => null, count: async () => 0 },
  submission: { findMany: async () => [], findUnique: async () => null, create: async (d: any) => d.data, update: async (d: any) => d.data, delete: async () => null, count: async () => 0 },
  topic: { findMany: async () => [], findUnique: async () => null, create: async (d: any) => d.data, update: async (d: any) => d.data, count: async () => 0 },
  post: { findMany: async () => [], findUnique: async () => null, create: async (d: any) => d.data, count: async () => 0 },
  user: { findMany: async () => [], findUnique: async () => null, create: async (d: any) => d.data, update: async (d: any) => d.data, upsert: async (d: any) => d.data },
  session: { findMany: async () => [], findUnique: async () => null, create: async (d: any) => d.data, deleteMany: async () => ({ count: 0 }), delete: async () => null },
  comment: { findMany: async () => [], findUnique: async () => null, create: async (d: any) => d.data, delete: async () => null, count: async () => 0 },
  group: { findMany: async () => [], findUnique: async () => null, create: async (d: any) => d.data, update: async (d: any) => d.data },
  questionBank: { findMany: async () => [], findUnique: async () => null, create: async (d: any) => d.data, count: async () => 0 },
  $connect: async () => {},
  $disconnect: async () => {},
};