import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../lib/services/data.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const role = searchParams.get('role');
    const teacherSubject = searchParams.get('teacherSubject');

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

    const result = await DataService.getUsersWithFilters({
      role: role || undefined,
      teacherSubject: teacherSubject || undefined,
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
      users: result.data?.data || [],
      pagination: result.data?.pagination,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await DataService.createUser(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'User created successfully',
        user: result.data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create user' },
      { status: 500 }
    );
  }
}
