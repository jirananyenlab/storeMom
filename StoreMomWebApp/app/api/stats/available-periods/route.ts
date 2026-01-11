import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { THAI_MONTHS, toBuddhistYear } from '@/constants';

// GET available months/years that have order data
export async function GET() {
  try {
    // Get all distinct year-month combinations from orders
    const orders = await prisma.order.findMany({
      select: {
        orderDate: true,
      },
      orderBy: {
        orderDate: 'desc',
      },
    });

    // Extract unique year-month combinations
    const periodsMap = new Map<string, { month: number; year: number; yearBE: number; monthName: string }>();
    
    orders.forEach((order) => {
      const date = new Date(order.orderDate);
      const month = date.getMonth(); // 0-11
      const year = date.getFullYear();
      const key = `${year}-${month}`;
      
if (!periodsMap.has(key)) {
        periodsMap.set(key, {
          month: month + 1, // 1-12 for API
          year,
          yearBE: toBuddhistYear(year),
          monthName: THAI_MONTHS[month] as string,
        });
      }
    });

    // Convert to array and sort by date descending
    const periods = Array.from(periodsMap.values()).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

    // If no data, return current month as default
    if (periods.length === 0) {
      const now = new Date();
      periods.push({
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        yearBE: toBuddhistYear(now.getFullYear()),
        monthName: THAI_MONTHS[now.getMonth()] as string,
      });
    }

    return NextResponse.json({
      periods,
      current: periods[0], // Most recent period
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available periods' },
      { status: 500 }
    );
  }
}
