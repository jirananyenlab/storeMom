import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET orders with pagination
// Query params: page (default 1), limit (default 10), customerId (optional), status (optional), productIds (optional, comma-separated)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');
    const productIds = searchParams.get('productIds');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause dynamically
    const where: Prisma.OrderWhereInput = {};
    if (customerId) {
      where.customerId = parseInt(customerId);
    }
    if (status) {
      where.status = status;
    }
  
    // Filter by product IDs - find orders that contain any of these products
    if (productIds) {
      const productIdArray = productIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      if (productIdArray.length > 0) {
        where.orderDetails = {
          some: {
            productId: {
              in: productIdArray
            }
          }
        };
      }
    }

    // Get total count and data in parallel
    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: {
          customer: {
            select: {
              fname: true,
              lname: true
            }
          }
        },
        orderBy: {
          orderDate: 'desc'
        },
        skip,
        take: limit,
      }),
    ]);

    // Format response to match expected structure
    const formattedOrders = orders.map(order => ({
      orderId: order.orderId,
      customer_id: order.customerId,
      customerName: `${order.customer.fname} ${order.customer.lname}`,
      totalAmount: order.totalAmount instanceof Prisma.Decimal ? order.totalAmount.toNumber() : Number(order.totalAmount),
      profit: order.profit instanceof Prisma.Decimal ? order.profit.toNumber() : Number(order.profit),
      orderDate: order.orderDate,
      status: order.status,
      note: order.note || null,
      created_at: order.createdAt,
      updated_at: order.updatedAt
    }));

    return NextResponse.json({
      data: formattedOrders,
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
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST create new order with details
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer_id, orderDate, items, status , note } = body;

    if (!customer_id || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Customer ID and order items are required' },
        { status: 400 }
      );
    }

    // Use Prisma transaction
    const result = await prisma.$transaction(async (tx) => {
      // Calculate totals and validate products
      let totalAmount = 0;
      let totalProfit = 0;

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { productId: item.productId }
        });

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        const productPrice = product.price instanceof Prisma.Decimal ? product.price.toNumber() : Number(product.price);
        
        if (product.quantityInStock < item.quantityOrdered) {
          throw new Error(`Insufficient stock for product ${item.productId}`);
        }

        const itemTotal = item.priceEach * item.quantityOrdered;
        const itemProfit = (item.priceEach - productPrice) * item.quantityOrdered;

        totalAmount += itemTotal;
        totalProfit += itemProfit;
      }

      // Create order
      const order = await tx.order.create({
        data: {
          customerId: customer_id,
          totalAmount: totalAmount,
          profit: totalProfit,
          orderDate: orderDate ? new Date(orderDate) : new Date(),
          status: status || 'pending',
          note: note || null
        }
      });

      // Create order details, update stock, and update sellPrice
      for (const item of items) {
        await tx.orderDetail.create({
          data: {
            orderId: order.orderId,
            productId: item.productId,
            quantityOrdered: item.quantityOrdered,
            priceEach: item.priceEach
          }
        });

        await tx.product.update({
          where: { productId: item.productId },
          data: {
            quantityInStock: {
              decrement: item.quantityOrdered
            },
            sellPrice: item.priceEach
          }
        });
      }

      // Fetch complete order with customer info
      const newOrder = await tx.order.findUnique({
        where: { orderId: order.orderId },
        include: {
          customer: {
            select: {
              fname: true,
              lname: true
            }
          }
        }
      });

      return newOrder;
    });

    if (!result) {
      throw new Error('Failed to create order');
    }

    // Format response
    const formattedOrder = {
      orderId: result.orderId,
      customer_id: result.customerId,
      customerName: `${result.customer.fname} ${result.customer.lname}`,
      totalAmount: result.totalAmount instanceof Prisma.Decimal ? result.totalAmount.toNumber() : Number(result.totalAmount),
      profit: result.profit instanceof Prisma.Decimal ? result.profit.toNumber() : Number(result.profit),
      orderDate: result.orderDate,
      status: result.status,
      note: result.note || null,
      created_at: result.createdAt,
      updated_at: result.updatedAt
    };

    return NextResponse.json(formattedOrder, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('not found') ? 404 : errorMessage.includes('Insufficient') ? 400 : 500 }
    );
  }
}
