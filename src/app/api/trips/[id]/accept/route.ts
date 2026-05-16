import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { riderId } = await req.json();
    
    // Find rider profile first
    const rider = await prisma.riderProfile.findUnique({ where: { userId: riderId } });
    if (!rider) {
      return NextResponse.json({ error: 'Rider profile not found' }, { status: 404 });
    }

    const trip = await prisma.trip.update({
      where: { id },
      data: {
        riderId: rider.id,
        status: 'ACCEPTED',
      },
    });
    
    return NextResponse.json(trip);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
