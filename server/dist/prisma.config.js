import { PrismaClient } from '@prisma/client'; // [1]
// Prevent multiple instances of Prisma Client in development
const globalForPrisma = global; // [1]
const prisma = globalForPrisma.prisma || new PrismaClient(); // [1]
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = prisma; // [1]
export default prisma; // [1]
