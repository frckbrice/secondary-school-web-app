import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../../lib/services/data.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate cuid format with regex
    const cuidRegex = /^c[a-z0-9]{24}$/;
    if (!cuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid contact ID format' },
        { status: 400 }
      );
    }

    // Note: DataService doesn't have getContactById method yet
    // You may need to add this method to DataService
    return NextResponse.json({
      success: false,
      message: 'Contact retrieval not implemented yet',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch contact' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate cuid format with regex
    const cuidRegex = /^c[a-z0-9]{24}$/;
    if (!cuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid contact ID format' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, response, responderId } = body;

    // Note: DataService doesn't have updateContactStatus method yet
    // You may need to add this method to DataService
    return NextResponse.json({
      success: false,
      message: 'Contact update not implemented yet',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to update contact' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate cuid format with regex
    const cuidRegex = /^c[a-z0-9]{24}$/;
    if (!cuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid contact ID' },
        { status: 400 }
      );
    }

    // Note: We don't have a deleteContact method in DataService yet
    // You might want to add this method
    return NextResponse.json(
      { success: false, message: 'Delete operation not implemented yet' },
      { status: 501 }
    );
  } catch (error: any) {
    console.error('Delete contact error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
