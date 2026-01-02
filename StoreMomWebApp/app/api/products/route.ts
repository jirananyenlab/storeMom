import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Helper to convert Decimal to number
function formatProduct(product: any) {
  return {
    ...product,
    price: typeof product.price === 'object' && product.price !== null 
      ? Number(product.price.toString()) 
      : Number(product.price)
  };
}

// GET products with pagination
// Query params: page (default 1), limit (default 10), search (optional)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where = search ? {
      productName: { contains: search },
    } : undefined;

    // Get total count and data in parallel
    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy: {
          productName: 'asc',
        },
        skip,
        take: limit,
      }),
    ]);

    // Convert Decimal to number for JSON response
    const formattedProducts = products.map(formatProduct);

    return NextResponse.json({
      data: formattedProducts,
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
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST create new product
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productName, quantityInStock, price, volume, description } = body;

    if (!productName || price === undefined) {
      return NextResponse.json(
        { error: 'Product name and price are required' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        productName,
        quantityInStock: quantityInStock || 0,
        price,
        volume: volume || null,
        description: description || null,
      },
    });

    return NextResponse.json(formatProduct(product), { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
