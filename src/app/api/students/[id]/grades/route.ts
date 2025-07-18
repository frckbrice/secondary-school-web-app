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
        { success: false, message: 'Invalid student ID format' },
        { status: 400 }
      );
    }

    // First get the student to get their studentId
    const studentResult = await DataService.getStudentById(id);
    if (!studentResult.success) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const academicYear = searchParams.get('academicYear');
    const term = searchParams.get('term');

    const result = await DataService.getStudentGradesWithFilters({
      studentId: studentResult.data?.studentId || '',
      subject: subject || undefined,
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
    const body = await request.json();
    const validatedData = insertStudentGradeSchema.parse(body);

    // Verify student exists
    const studentResult = await DataService.getStudentByStudentId(id);
    if (!studentResult.success) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    const result = await DataService.createStudentGrade(validatedData);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: true, grade: result.data },
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
