import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET total orders count
export async function GET() {
  try {
    const count = await prisma.order.count();

    return NextResponse.json({
      count,
      label: 'คำสั่งซื้อ',
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order count' },
      { status: 500 }
    );
  }
}
