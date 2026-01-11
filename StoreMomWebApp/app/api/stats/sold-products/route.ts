import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { THAI_MONTHS, toBuddhistYear } from '@/constants';

// GET sold products with pagination
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

    // Get all sold items grouped by productId for this month (to get total count)
    const allSoldItems = await prisma.orderDetail.groupBy({
      by: ['productId'],
      where: {
        order: {
          orderDate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      },
      _sum: {
        quantityOrdered: true,
      },
      orderBy: {
        _sum: {
          quantityOrdered: 'desc',
        },
      },
    });

    const totalCount = allSoldItems.length;
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;

    // Get paginated sold items
    const paginatedSoldItems = allSoldItems.slice(skip, skip + limit);

    // Get product details for paginated sold items
    const soldProductIds = paginatedSoldItems.map((p) => p.productId);
    const soldProducts = await prisma.product.findMany({
      where: {
        productId: {
          in: soldProductIds,
        },
      },
      select: {
        productId: true,
        productName: true,
        volume: true,
        quantityInStock: true,
        price: true,
      },
    });

    // Combine sold items with their product details
    const soldItemsWithDetails = paginatedSoldItems.map((item) => {
      const product = soldProducts.find((p) => p.productId === item.productId);
      return {
        productId: item.productId,
        productName: product?.productName || 'Unknown',
        volume: product?.volume || null,
        quantitySold: item._sum.quantityOrdered || 0,
        remainingStock: product?.quantityInStock || 0,
        price: Number(product?.price || 0),
      };
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
      products: soldItemsWithDetails,
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sold products data' },
      { status: 500 }
    );
  }
}
