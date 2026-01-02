import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET total products count
export async function GET() {
  try {
    const count = await prisma.product.count();

    return NextResponse.json({
      count,
      label: 'สินค้า',
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product count' },
      { status: 500 }
    );
  }
}
