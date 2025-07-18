import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../../lib/services/data.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, password } = body;

    if (!studentId || !password) {
      return NextResponse.json(
        { message: 'Student ID and password are required' },
        { status: 400 }
      );
    }

    const authResult = await DataService.authenticateStudent(
      studentId,
      password
    );
    if (!authResult.success) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Get student data
    const studentResult = await DataService.getStudentByStudentId(studentId);
    if (!studentResult.success) {
      return NextResponse.json(
        { message: 'Student not found' },
        { status: 404 }
      );
    }

    // Create session token
    const sessionResult = await DataService.createSession(studentId);
    if (!sessionResult.success) {
      return NextResponse.json(
        { message: 'Failed to create session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      student: {
        id: studentResult.data?.id,
        studentId: studentResult.data?.studentId,
        fullName: studentResult.data?.fullName,
        email: studentResult.data?.email,
        className: studentResult.data?.className,
        gender: studentResult.data?.gender,
      },
      token: sessionResult.data,
    });
  } catch (error) {
    return NextResponse.json({ message: 'Login failed' }, { status: 500 });
  }
}
