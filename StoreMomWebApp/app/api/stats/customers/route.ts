import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET total customers count
export async function GET() {
  try {
    const count = await prisma.customer.count();

    return NextResponse.json({
      count,
      label: 'ลูกค้า',
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer count' },
      { status: 500 }
    );
  }
}
