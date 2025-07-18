import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../lib/services/data.service';
import { insertBookingSchema } from '../../../schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const status = searchParams.get('status');
    const subject = searchParams.get('subject');
    const teacherName = searchParams.get('teacherName');

    // Calculate offset from page and limit
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    const offset = (pageNum - 1) * limitNum;

    // Use the new filtered method instead of fetching all data
    const result = await DataService.getBookingsWithFilters({
      status: status || undefined,
      subject: subject || undefined,
      teacherName: teacherName || undefined,
      limit: limitNum,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bookings: result.data || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        offset,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Convert date strings to Date objects if provided
    const processedBody = {
      ...body,
      preferredDate: body.preferredDate
        ? new Date(body.preferredDate)
        : undefined,
      confirmedDate: body.confirmedDate
        ? new Date(body.confirmedDate)
        : undefined,
    };

    const validatedData = insertBookingSchema.parse(processedBody);

    const result = await DataService.createBooking(validatedData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Booking created successfully',
        booking: result.data,
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
      { success: false, message: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
