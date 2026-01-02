import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET single order with details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { orderId: parseInt(id) },
      include: {
        customer: {
          select: {
            fname: true,
            lname: true
          }
        },
        orderDetails: {
          include: {
            product: {
              select: {
                productName: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Format response
    const formattedOrder = {
      orderId: order.orderId,
      customer_id: order.customerId,
      customerName: `${order.customer.fname} ${order.customer.lname}`,
      totalAmount: order.totalAmount instanceof Prisma.Decimal ? order.totalAmount.toNumber() : Number(order.totalAmount),
      profit: order.profit instanceof Prisma.Decimal ? order.profit.toNumber() : Number(order.profit),
      orderDate: order.orderDate,
      status: order.status,
      items: order.orderDetails.map(detail => ({
        orderDetailId: detail.orderDetailId,
        orderId: detail.orderId,
        productId: detail.productId,
        productName: detail.product.productName,
        quantityOrdered: detail.quantityOrdered,
        priceEach: detail.priceEach instanceof Prisma.Decimal ? detail.priceEach.toNumber() : Number(detail.priceEach),
        subtotal: (detail.priceEach instanceof Prisma.Decimal ? detail.priceEach.toNumber() : Number(detail.priceEach)) * detail.quantityOrdered
      }))
    };

    return NextResponse.json(formattedOrder);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// DELETE order
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Use Prisma transaction to restore stock and delete order
    await prisma.$transaction(async (tx) => {
      // Get order details to restore stock
      const orderDetails = await tx.orderDetail.findMany({
        where: { orderId: parseInt(id) }
      });

      if (orderDetails.length === 0) {
        throw new Error('ORDER_NOT_FOUND');
      }

      // Restore stock
      for (const detail of orderDetails) {
        await tx.product.update({
          where: { productId: detail.productId },
          data: {
            quantityInStock: {
              increment: detail.quantityOrdered
            }
          }
        });
      }

      // Delete order details first
      await tx.orderDetail.deleteMany({
        where: { orderId: parseInt(id) }
      });

      // Delete order
      await tx.order.delete({
        where: { orderId: parseInt(id) }
      });
    });

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    if (error instanceof Error && error.message === 'ORDER_NOT_FOUND') {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}

// PUT update order status
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['pending', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required (pending, completed, cancelled)' },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { orderId: parseInt(id) },
      data: { status },
      include: {
        customer: {
          select: {
            fname: true,
            lname: true
          }
        }
      }
    });

    // Format response
    const formattedOrder = {
      orderId: updatedOrder.orderId,
      customer_id: updatedOrder.customerId,
      customerName: `${updatedOrder.customer.fname} ${updatedOrder.customer.lname}`,
      totalAmount: updatedOrder.totalAmount instanceof Prisma.Decimal ? updatedOrder.totalAmount.toNumber() : Number(updatedOrder.totalAmount),
      profit: updatedOrder.profit instanceof Prisma.Decimal ? updatedOrder.profit.toNumber() : Number(updatedOrder.profit),
      orderDate: updatedOrder.orderDate,
      status: updatedOrder.status
    };

    return NextResponse.json(formattedOrder);
  } catch (error) {
    console.error('Database error:', error);
    // Prisma throws P2025 when record not found
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
