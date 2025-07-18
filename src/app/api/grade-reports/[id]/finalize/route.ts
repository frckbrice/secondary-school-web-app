import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../../../lib/services/data.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate cuid format with regex
    const cuidRegex = /^c[a-z0-9]{24}$/;
    if (!cuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid report ID format' },
        { status: 400 }
      );
    }

    const result = await DataService.finalizeGradeReport(id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Grade report finalized successfully',
      report: result.data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to finalize grade report' },
      { status: 500 }
    );
  }
}
