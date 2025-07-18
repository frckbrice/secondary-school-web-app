import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../../lib/services/data.service';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { firstName, lastName, email, phone, subject, status, gender } = body;

    // Update the teacher using the data service
    const result = await DataService.updateUser(id, {
      fullName: `${firstName} ${lastName}`,
      email,
      phone,
      teacherSubject: subject,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.message || 'Failed to update teacher' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Teacher updated successfully',
      teacher: result.data,
    });
  } catch (error) {
    console.error('Error updating teacher:', error);
    return NextResponse.json(
      { error: 'Failed to update teacher' },
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

    // Delete the teacher using the data service
    const result = await DataService.deleteUser(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message || 'Failed to delete teacher' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Teacher deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return NextResponse.json(
      { error: 'Failed to delete teacher' },
      { status: 500 }
    );
  }
}
