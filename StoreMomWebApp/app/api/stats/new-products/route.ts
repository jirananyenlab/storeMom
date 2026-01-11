import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { THAI_MONTHS, toBuddhistYear } from '@/constants';

// GET new products with pagination
// Query params: month (1-12), year (e.g., 2024), page (1-based), limit (default 5)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Get month and year from query params, default to current
    const now = new Date();
    const month = parseInt(searchParams.get('month') || '') || (now.getMonth() + 1);
    const year = parseInt(searchParams.get('year') || '') || now.getFullYear();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '5')));
    
    // Validate month
    const validMonth = Math.max(1, Math.min(12, month));
    
    // Calculate start and end of the selected month
    const startOfMonth = new Date(year, validMonth - 1, 1);
    const endOfMonth = new Date(year, validMonth, 0, 23, 59, 59, 999);

    // Get total count
    const totalCount = await prisma.product.count({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;

    // Get newly added products this month with pagination
    const newProducts = await prisma.product.findMany({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        productId: true,
        productName: true,
        volume: true,
        quantityInStock: true,
        price: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    const monthName = THAI_MONTHS[validMonth - 1];
    const yearBE = toBuddhistYear(year);

    return NextResponse.json({
      month: validMonth,
      year,
      yearBE,
      monthName,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      products: newProducts.map((p) => ({
        productId: p.productId,
        productName: p.productName,
        volume: p.volume,
        quantityInStock: p.quantityInStock,
        price: Number(p.price),
        createdAt: p.createdAt,
      })),
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch new products data' },
      { status: 500 }
    );
  }
}
