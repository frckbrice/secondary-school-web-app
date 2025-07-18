import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../lib/services/data.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const className = searchParams.get('className');
    const gender = searchParams.get('gender');
    const isActive = searchParams.get('isActive');

    // Parse pagination parameters
    const pageNumber = page ? parseInt(page) : 1;
    const limitNumber = limit ? parseInt(limit) : 10;

    // Validate pagination parameters
    if (pageNumber < 1) {
      return NextResponse.json(
        { success: false, message: 'Page must be greater than 0' },
        { status: 400 }
      );
    }

    if (limitNumber < 1 || limitNumber > 100) {
      return NextResponse.json(
        { success: false, message: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    const result = await DataService.getStudentsWithFilters({
      className: className || undefined,
      gender: gender || undefined,
      isActive: isActive ? isActive === 'true' : undefined,
      page: pageNumber,
      limit: limitNumber,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      students: result.data?.data || [],
      pagination: result.data?.pagination,
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await DataService.createStudent(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Student created successfully',
        student: result.data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create student' },
      { status: 500 }
    );
  }
}
