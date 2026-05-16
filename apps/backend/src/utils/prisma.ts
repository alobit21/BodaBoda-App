// Use the custom generated client from the shared packages/db folder
// This avoids the ENOENT errors on Vercel caused by node_modules hoisting
import { PrismaClient } from '../../../../packages/db/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
