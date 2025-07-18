import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../../../lib/services/data.service';

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

    if (!status) {
      return NextResponse.json(
        { success: false, message: 'Status is required' },
        { status: 400 }
      );
    }

    const result = await DataService.updateContactStatus(
      id,
      status,
      responderId,
      response
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contact status updated successfully',
      contact: result.data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to update contact status' },
      { status: 500 }
    );
  }
}
