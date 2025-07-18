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
        { success: false, message: 'Invalid application ID format' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, notes, reviewerId } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, message: 'Status is required' },
        { status: 400 }
      );
    }

    const result = await DataService.updateApplicationStatus(
      id,
      status,
      reviewerId,
      notes
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Application status updated successfully',
      application: result.data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to update application status' },
      { status: 500 }
    );
  }
}
