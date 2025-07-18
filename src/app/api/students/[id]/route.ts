import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../../lib/services/data.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate cuid format (basic check - cuid starts with 'c' and is 25 chars)
    if (!id || !id.startsWith('c') || id.length !== 25) {
      return NextResponse.json(
        { success: false, message: 'Invalid student ID format' },
        { status: 400 }
      );
    }

    // Try to get student by ID first, then by studentId
    let result = await DataService.getStudentById(id);

    if (!result.success) {
      // If not found by ID, try by studentId
      result = await DataService.getStudentByStudentId(id);
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      student: result.data,
    });
  } catch (error: any) {
    console.error('Get student error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
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
    const updateData = await request.json();

    // Validate cuid format
    if (!id || !id.startsWith('c') || id.length !== 25) {
      return NextResponse.json(
        { success: false, message: 'Invalid student ID format' },
        { status: 400 }
      );
    }

    // Try to update by ID first, then by studentId
    let result = await DataService.updateStudent(id, updateData);

    if (!result.success) {
      // If not found by ID, try to find by studentId and update by ID
      const studentResult = await DataService.getStudentByStudentId(id);
      if (studentResult.success) {
        result = await DataService.updateStudent(
          studentResult.data?.id as string,
          updateData
        );
      }
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Student updated successfully',
      student: result.data,
    });
  } catch (error: any) {
    console.error('Update student error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
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

    // Validate cuid format
    if (!id || !id.startsWith('c') || id.length !== 25) {
      return NextResponse.json(
        { success: false, message: 'Invalid student ID format' },
        { status: 400 }
      );
    }

    // Try to delete by ID first, then by studentId
    let result = await DataService.deleteStudent(id);

    if (!result.success) {
      // If not found by ID, try to find by studentId and delete by ID
      const studentResult = await DataService.getStudentByStudentId(id);
      if (studentResult.success) {
        result = await DataService.deleteStudent(
          studentResult.data?.id as string
        );
      }
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete student error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
