import type { AdminSession } from "@/lib/types";
import { db } from "@/lib/mock-db";
import { getPrismaClient } from "@/lib/prisma";

export async function createAdminSession(userId: string, role: AdminSession["role"]) {
  const prisma = getPrismaClient();
  if (!prisma) {
    return db.createAdminSession(userId, role);
  }

  await prisma.adminSession.deleteMany({ where: { userId } });
  const record = await prisma.adminSession.create({
    data: {
      userId,
      role,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 8),
    },
  });

  return {
    id: record.id,
    userId: record.userId,
    role: record.role as AdminSession["role"],
    createdAt: record.createdAt.toISOString(),
    expiresAt: record.expiresAt.toISOString(),
  } satisfies AdminSession;
}

export async function findAdminSession(id: string) {
  const prisma = getPrismaClient();
  if (!prisma) {
    return db.findAdminSession(id);
  }

  const record = await prisma.adminSession.findUnique({ where: { id } });
  if (!record) {
    return null;
  }

  if (record.expiresAt.getTime() <= Date.now()) {
    await prisma.adminSession.delete({ where: { id } });
    return null;
  }

  return {
    id: record.id,
    userId: record.userId,
    role: record.role as AdminSession["role"],
    createdAt: record.createdAt.toISOString(),
    expiresAt: record.expiresAt.toISOString(),
  } satisfies AdminSession;
}

export async function deleteAdminSession(id: string) {
  const prisma = getPrismaClient();
  if (!prisma) {
    db.deleteAdminSession(id);
    return;
  }

  await prisma.adminSession.deleteMany({ where: { id } });
}
