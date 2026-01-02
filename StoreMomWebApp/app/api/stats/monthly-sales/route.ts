import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Thai month names
const thaiMonths = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

// GET monthly sales summary with top selling products
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

    // Get monthly orders summary
    const monthlyOrders = await prisma.order.findMany({
      where: {
        orderDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        totalAmount: true,
        profit: true,
      },
    });

    const totalSales = monthlyOrders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0
    );
    const totalProfit = monthlyOrders.reduce(
      (sum, order) => sum + Number(order.profit),
      0
    );
    const orderCount = monthlyOrders.length;

    // Get top selling products this month
    const topProducts = await prisma.orderDetail.groupBy({
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
      take: 5,
    });

    // Get product details for top products
    const productIds = topProducts.map((p) => p.productId);
    const products = await prisma.product.findMany({
      where: {
        productId: {
          in: productIds,
        },
      },
      select: {
        productId: true,
        productName: true,
        price: true,
        volume: true,
      },
    });

    // Combine top products with their details
    const topSellingProducts = topProducts.map((tp) => {
      const product = products.find((p) => p.productId === tp.productId);
      return {
        productId: tp.productId,
        productName: product?.productName || 'Unknown',
        volume: product?.volume || null,
        price: Number(product?.price || 0),
        quantitySold: tp._sum.quantityOrdered || 0,
      };
    });

    const monthName = thaiMonths[validMonth - 1];
    const yearBE = year + 543; // Convert to Buddhist Era

    return NextResponse.json({
      month: validMonth,
      year,
      yearBE,
      monthName,
      label: `สรุปยอดขาย ${monthName} ${yearBE}`,
      summary: {
        totalSales,
        totalProfit,
        orderCount,
      },
      topSellingProducts,
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monthly sales' },
      { status: 500 }
    );
  }
}
