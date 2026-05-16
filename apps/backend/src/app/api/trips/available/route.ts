import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

export async function GET() {
  try {
    const trips = await prisma.trip.findMany({
      where: { status: 'SEARCHING' },
      include: { customer: { select: { name: true, phone: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(trips);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
