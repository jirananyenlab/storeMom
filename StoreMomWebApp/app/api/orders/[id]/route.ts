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
                productName: true,
                price: true,
                quantityInStock: true
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
      items: order.orderDetails.map(detail => {
        const priceEach = detail.priceEach instanceof Prisma.Decimal ? detail.priceEach.toNumber() : Number(detail.priceEach);
        const originalPrice = detail.product.price instanceof Prisma.Decimal ? detail.product.price.toNumber() : Number(detail.product.price);
        return {
          orderDetailId: detail.orderDetailId,
          orderId: detail.orderId,
          productId: detail.productId,
          productName: detail.product.productName,
          quantityOrdered: detail.quantityOrdered,
          priceEach,
          originalPrice,
          quantityInStock: detail.product.quantityInStock,
          subtotal: priceEach * detail.quantityOrdered
        };
      })
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

// PUT update order (status, customerId, and/or items - items only for pending orders)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, customerId, items } = body;

    // Get current order to check status
    const currentOrder = await prisma.order.findUnique({
      where: { orderId: parseInt(id) },
      include: {
        orderDetails: true
      }
    });

    if (!currentOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // If items are provided, only allow for pending orders
    if (items && items.length > 0 && currentOrder.status !== 'pending') {
      return NextResponse.json(
        { error: 'สามารถแก้ไขรายการสินค้าได้เฉพาะออเดอร์ที่ยังไม่จ่ายเงินเท่านั้น' },
        { status: 400 }
      );
    }

    // If updating items, use transaction
    if (items && items.length > 0) {
      const result = await prisma.$transaction(async (tx) => {
        // Restore stock from old order details
        for (const detail of currentOrder.orderDetails) {
          await tx.product.update({
            where: { productId: detail.productId },
            data: {
              quantityInStock: {
                increment: detail.quantityOrdered
              }
            }
          });
        }

        // Delete old order details
        await tx.orderDetail.deleteMany({
          where: { orderId: parseInt(id) }
        });

        // Calculate new totals and validate products
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
            throw new Error(`สต็อกไม่พอสำหรับสินค้า ${product.productName}`);
          }

          const itemTotal = item.priceEach * item.quantityOrdered;
          const itemProfit = (item.priceEach - productPrice) * item.quantityOrdered;

          totalAmount += itemTotal;
          totalProfit += itemProfit;
        }

        // Create new order details and update stock
        for (const item of items) {
          await tx.orderDetail.create({
            data: {
              orderId: parseInt(id),
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
              }
            }
          });
        }

        // Build update data
        const updateData: { status?: string; customerId?: number; totalAmount: number; profit: number } = {
          totalAmount,
          profit: totalProfit
        };

        if (status && ['pending', 'completed', 'cancelled'].includes(status)) {
          updateData.status = status;
        }

        if (customerId) {
          const customer = await tx.customer.findUnique({
            where: { id: parseInt(customerId) }
          });
          if (!customer) {
            throw new Error('Customer not found');
          }
          updateData.customerId = parseInt(customerId);
        }

        // Update order
        const updatedOrder = await tx.order.update({
          where: { orderId: parseInt(id) },
          data: updateData,
          include: {
            customer: {
              select: {
                fname: true,
                lname: true
              }
            }
          }
        });

        return updatedOrder;
      });

      // Format response
      const formattedOrder = {
        orderId: result.orderId,
        customer_id: result.customerId,
        customerName: `${result.customer.fname} ${result.customer.lname}`,
        totalAmount: result.totalAmount instanceof Prisma.Decimal ? result.totalAmount.toNumber() : Number(result.totalAmount),
        profit: result.profit instanceof Prisma.Decimal ? result.profit.toNumber() : Number(result.profit),
        orderDate: result.orderDate,
        status: result.status
      };

      return NextResponse.json(formattedOrder);
    }

    // Simple update (status and/or customerId only)
    const updateData: { status?: string; customerId?: number } = {};

    if (status) {
      if (!['pending', 'completed', 'cancelled'].includes(status)) {
        return NextResponse.json(
          { error: 'Valid status is required (pending, completed, cancelled)' },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (customerId) {
      // Verify customer exists
      const customer = await prisma.customer.findUnique({
        where: { id: parseInt(customerId) }
      });
      if (!customer) {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        );
      }
      updateData.customerId = parseInt(customerId);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { orderId: parseInt(id) },
      data: updateData,
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
    if (error instanceof Error && 'code' in error && (error as { code: string }).code === 'P2025') {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    const errorMessage = error instanceof Error ? error.message : 'Failed to update order';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
