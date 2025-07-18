import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../../../lib/services/data.service';
import { insertStudentGradeSchema } from '../../../../../schema';

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
        { success: false, message: 'Invalid report ID format' },
        { status: 400 }
      );
    }

    const result = await DataService.getStudentGradesByReportId(id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      grades: result.data || [],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch student grades' },
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
    if (!cuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid report ID format' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = insertStudentGradeSchema.parse({
      ...body,
      gradeReportId: id,
    });

    const result = await DataService.createStudentGrade(validatedData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Student grade created successfully',
        grade: result.data,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Failed to create student grade' },
      { status: 500 }
    );
  }
}
