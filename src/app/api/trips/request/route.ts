import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

export async function POST(req: Request) {
  try {
    const { customerId, guestName, guestPhone, pickupLocation, destination, price } = await req.json();
    
    const trip = await prisma.trip.create({
      data: {
        customerId: customerId || null,
        guestName,
        guestPhone,
        pickupLocation,
        destination,
        price,
        status: 'SEARCHING',
      },
    });
    
    return NextResponse.json(trip, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
