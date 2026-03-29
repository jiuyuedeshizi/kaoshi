import { PrismaClient } from "@prisma/client";

declare global {
  var __prisma: PrismaClient | undefined;
}

export function getPrismaClient() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!global.__prisma) {
    global.__prisma = new PrismaClient();
  }

  return global.__prisma;
}
