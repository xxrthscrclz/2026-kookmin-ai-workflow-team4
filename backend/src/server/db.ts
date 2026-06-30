import { PrismaClient } from "@prisma/client";

// 개발 중 tsx watch 재시작으로 커넥션이 누적되지 않도록 글로벌 싱글톤으로 보관한다.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error"] : ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
