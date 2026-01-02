import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET single customer
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(id) },
      include: {
        orders: {
          include: {
            orderDetails: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

// PUT update customer
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { fname, lname, phone, email, address } = body;

    if (!fname || !lname) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.update({
      where: { id: parseInt(id) },
      data: {
        fname,
        lname,
        phone: phone || null,
        email: email || null,
        address: address || null,
      },
    });

    return NextResponse.json(customer);
  } catch (error: any) {
    console.error('Database error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

// DELETE customer
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.customer.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error: any) {
    console.error('Database error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete customer with existing orders' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
