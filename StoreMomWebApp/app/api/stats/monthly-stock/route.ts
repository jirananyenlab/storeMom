import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { THAI_MONTHS, toBuddhistYear } from '@/constants';

// GET monthly stock summary
// Query params: month (1-12), year (e.g., 2024)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Get month and year from query params, default to current
    const now = new Date();
    const month = parseInt(searchParams.get('month') || '') || (now.getMonth() + 1); // 1-12
    const year = parseInt(searchParams.get('year') || '') || now.getFullYear();
    
    // Validate month
    const validMonth = Math.max(1, Math.min(12, month));
    
    // Calculate start and end of the selected month
    const startOfMonth = new Date(year, validMonth - 1, 1);
    const endOfMonth = new Date(year, validMonth, 0, 23, 59, 59, 999);

    // Get newly added products this month (products created in this month)
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
    });

    // Get items sold this month (from order details)
    const soldItems = await prisma.orderDetail.groupBy({
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

    // Calculate totals
    const totalNewProducts = newProducts.length;
    const totalItemsSold = soldItems.reduce(
      (sum, item) => sum + (item._sum.quantityOrdered || 0),
      0
    );

    // Get all products for remaining stock summary
    const allProducts = await prisma.product.findMany({
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
    });

    const totalRemainingStock = allProducts.reduce(
      (sum, product) => sum + product.quantityInStock,
      0
    );

    // Low stock products (less than 10 items)
    const lowStockProducts = allProducts.filter(
      (product) => product.quantityInStock < 10
    );

    const monthName = THAI_MONTHS[validMonth - 1];
    const yearBE = toBuddhistYear(year);

    return NextResponse.json({
      month: validMonth,
      year,
      yearBE,
      monthName,
      label: `สรุปสต็อก ${monthName} ${yearBE}`,
      summary: {
        totalNewProducts,
        totalItemsSold,
        totalRemainingStock,
        lowStockCount: lowStockProducts.length,
      },
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monthly stock data' },
      { status: 500 }
    );
  }
}
