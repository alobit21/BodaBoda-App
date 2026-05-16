import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'boda-secret-key';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, password } = body;

    console.log('Login attempt for:', phone);

    const user = await prisma.user.findUnique({ where: { phone } });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    
    return NextResponse.json({ 
      token, 
      user: { id: user.id, phone: user.phone, role: user.role, name: user.name } 
    });
  } catch (error: any) {
    // THIS WILL SHOW US THE ERROR IN THE BROWSER NETWORK TAB
    return NextResponse.json({ 
      error: 'Backend Crash',
      message: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}

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
