import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET customers with pagination
// Query params: page (default 1), limit (default 10), search (optional)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where = search ? {
      OR: [
        { fname: { contains: search } },
        { lname: { contains: search } },
      ],
    } : undefined;

    // Get total count and data in parallel
    const [total, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

// POST create new customer
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fname, lname, phone, email, address } = body;

    if (!fname || !lname) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        fname,
        lname,
        phone: phone || null,
        email: email || null,
        address: address || null,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
