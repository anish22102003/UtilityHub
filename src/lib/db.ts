import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

let prisma: PrismaClient;

const databaseUrl = process.env.DATABASE_URL;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

if (process.env.NODE_ENV === 'production') {
  if (databaseUrl) {
    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
  } else {
    // If no DB url, construct client without adapter to allow static compilation.
    // Real calls will warn and fail gracefully.
    prisma = new PrismaClient();
  }
} else {
  if (!globalForPrisma.prisma) {
    if (databaseUrl) {
      const pool = new Pool({ connectionString: databaseUrl });
      const adapter = new PrismaPg(pool);
      globalForPrisma.prisma = new PrismaClient({ adapter });
    } else {
      globalForPrisma.prisma = new PrismaClient();
    }
  }
  prisma = globalForPrisma.prisma;
}

export { prisma };
export default prisma;
