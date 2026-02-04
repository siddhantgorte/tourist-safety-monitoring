import { PrismaClient } from '@prisma/client';

// Prisma 7.x+ requires explicit config or correct env setup.
// Passing explicit datasources if needed, or letting it infer from env.
// If it throws "non-empty options", we'll provide a log level as a dummy option.
export const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});
