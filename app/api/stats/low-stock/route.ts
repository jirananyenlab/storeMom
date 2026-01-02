import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET count of products with low stock (< 10)
export async function GET() {
  try {
    const count = await prisma.product.count({
      where: {
        quantityInStock: {
          lt: 10,
        },
      },
    });

    return NextResponse.json({
      count,
      label: 'สินค้าใกล้หมด',
      threshold: 10,
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch low stock count' },
      { status: 500 }
    );
  }
}
