import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, password, name, role } = body;

    console.log('Registering user:', phone);

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

    console.log('User created:', user.id);
    return NextResponse.json({ message: 'User created successfully', userId: user.id }, { status: 201 });
  } catch (error: any) {
    console.error('REGISTRATION ERROR:', error);
    return NextResponse.json({ 
      error: 'Registration failed',
      message: error.message 
    }, { status: 400 });
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
