import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  let adapter;

  if (
    connectionString.startsWith("postgres://") ||
    connectionString.startsWith("postgresql://")
  ) {
    adapter = new PrismaPg({
      connectionString,
    });
  } else if (
    connectionString.startsWith("mysql://") ||
    connectionString.startsWith("mariadb://")
  ) {
    adapter = new PrismaMariaDb(connectionString);
  } else {
    throw new Error(
      "Unsupported DATABASE_URL protocol. Use postgresql://, postgres://, mysql://, or mariadb://",
    );
  }

  return new PrismaClient({ adapter });
}

const prismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaClient;
}

export const prisma = prismaClient;
export default prismaClient;
