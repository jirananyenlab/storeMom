import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET low stock products with pagination
// Query params: page (1-based), limit (default 10)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '10')));
    
    // Low stock threshold
    const lowStockThreshold = 10;

    // Get total count of low stock products
    const totalCount = await prisma.product.count({
      where: {
        quantityInStock: {
          lt: lowStockThreshold,
        },
      },
    });

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;

    // Get low stock products with pagination
    const lowStockProducts = await prisma.product.findMany({
      where: {
        quantityInStock: {
          lt: lowStockThreshold,
        },
      },
      select: {
        productId: true,
        productName: true,
        volume: true,
        quantityInStock: true,
        price: true,
      },
      orderBy: {
        quantityInStock: 'asc',
      },
      skip,
      take: limit,
    });

    return NextResponse.json({
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      products: lowStockProducts.map((p) => ({
        productId: p.productId,
        productName: p.productName,
        volume: p.volume,
        quantityInStock: p.quantityInStock,
        price: Number(p.price),
      })),
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch low stock products' },
      { status: 500 }
    );
  }
}
