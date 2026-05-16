import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { phone, password, name, role } = await req.json();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        phone,
        password: hashedPassword,
        name,
        role: role || 'CUSTOMER',
      },
    });

    if (role === 'RIDER') {
      await prisma.riderProfile.create({
        data: {
          userId: user.id,
          plateNumber: `MC-${Math.floor(1000 + Math.random() * 9000)}`,
        },
      });
    }

    return NextResponse.json({ message: 'User created successfully', userId: user.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
