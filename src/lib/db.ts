import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

let prisma: PrismaClient;

const databaseUrl = process.env.DATABASE_URL;

const makeMockPrisma = () => {
  if (process.env.NODE_ENV !== 'production') {
    console.warn("Prisma: DATABASE_URL is not set. Using mock database client.");
  }
  return new Proxy({} as any, {
    get(target, prop) {
      if (prop === 'then') return undefined;
      return new Proxy(() => {}, {
        get(t, p) {
          if (p === 'then') return undefined;
          return async (...args: any[]) => {
            if (process.env.NODE_ENV !== 'production') {
              console.warn(`Mock Prisma: ${String(prop)}.${String(p)} called.`);
            }
            if (p === 'count') return 0;
            if (p === 'findMany') return [];
            if (p === 'groupBy') return [];
            if (p === 'create') {
              const data = args[0]?.data || {};
              return {
                id: "mock-id",
                createdAt: new Date(),
                updatedAt: new Date(),
                ...data
              };
            }
            if (p === 'findUnique' || p === 'findFirst') return null;
            if (p === 'update') return null;
            if (p === 'delete') return null;
            return null;
          };
        },
        apply(t, thisArg, args) {
          return Promise.resolve(null);
        }
      });
    }
  });
};

if (databaseUrl) {
  const globalForPrisma = global as unknown as { prisma: PrismaClient };
  if (process.env.NODE_ENV === 'production') {
    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
  } else {
    if (!globalForPrisma.prisma) {
      const pool = new Pool({ connectionString: databaseUrl });
      const adapter = new PrismaPg(pool);
      globalForPrisma.prisma = new PrismaClient({ adapter });
    }
    prisma = globalForPrisma.prisma;
  }
} else {
  // If no DB url, construct mock client to allow static compilation and running without a database.
  prisma = makeMockPrisma() as unknown as PrismaClient;
}

export { prisma };
export default prisma;
