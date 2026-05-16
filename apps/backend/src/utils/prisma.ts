import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  const url = process.env.DATABASE_URL;
  
  if (!url) {
    console.error('CRITICAL: DATABASE_URL is missing from process.env');
    // For debugging, we can see what variables ARE available (safely)
    console.log('Available Env Vars (keys only):', Object.keys(process.env).filter(k => !k.includes('SECRET') && !k.includes('KEY')));
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: url
      }
    }
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
