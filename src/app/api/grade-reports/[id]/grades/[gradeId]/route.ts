import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../../../../lib/services/data.service';
import { insertStudentGradeSchema } from '../../../../../../schema';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; gradeId: string }> }
) {
  try {
    const { id, gradeId } = await params;

    // Validate cuid format with regex
    const cuidRegex = /^c[a-z0-9]{24}$/;
    if (!cuidRegex.test(id) || !cuidRegex.test(gradeId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid ID format' },
        { status: 400 }
      );
    }

    const result = await DataService.getStudentGradeById(gradeId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      grade: result.data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch student grade' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; gradeId: string }> }
) {
  try {
    const { id, gradeId } = await params;

    // Validate cuid format with regex
    const cuidRegex = /^c[a-z0-9]{24}$/;
    if (!cuidRegex.test(id) || !cuidRegex.test(gradeId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid ID format' },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    const validatedData = insertStudentGradeSchema.partial().parse(updateData);

    const result = await DataService.updateStudentGrade(gradeId, validatedData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Student grade updated successfully',
      grade: result.data,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Failed to update student grade' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; gradeId: string }> }
) {
  try {
    const { id, gradeId } = await params;

    // Validate cuid format with regex
    const cuidRegex = /^c[a-z0-9]{24}$/;
    if (!cuidRegex.test(id) || !cuidRegex.test(gradeId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid ID format' },
        { status: 400 }
      );
    }

    const result = await DataService.deleteStudentGrade(gradeId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Student grade deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to delete student grade' },
      { status: 500 }
    );
  }
}
