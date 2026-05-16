import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'boda-secret-key';

export async function POST(req: Request) {
  try {
    const { phone, password } = await req.json();
    const user = await prisma.user.findUnique({ where: { phone } });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    
    return NextResponse.json({ 
      token, 
      user: { id: user.id, phone: user.phone, role: user.role, name: user.name } 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
