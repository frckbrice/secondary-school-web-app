import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../../../lib/services/data.service';
import { insertGradeReportSchema } from '../../../../../schema';

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
        { success: false, message: 'Invalid teacher ID format' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get('academicYear');
    const term = searchParams.get('term');

    const result = await DataService.getGradeReports({
      teacherId: id,
      academicYear: academicYear || undefined,
      term: term || undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reports: result.data || [],
    });
  } catch (error) {
    console.error('Error fetching grade reports', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch grade reports' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate cuid format with regex
    const cuidRegex = /^c[a-z0-9]{24}$/;
    if (!id || !cuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid teacher ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = insertGradeReportSchema.parse(body);

    // Set the teacherId from the URL parameter
    validatedData.teacherId = id;

    const result = await DataService.createGradeReport(validatedData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Grade report created successfully',
        gradeReport: result.data,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create grade report error:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
