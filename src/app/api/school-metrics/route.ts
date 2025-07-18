import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../lib/services/data.service';
import { insertSchoolMetricsSchema } from '../../../schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get('academicYear');
    const term = searchParams.get('term');
    const limit = searchParams.get('limit');

    // Use the new filtered method instead of fetching all data
    const result = await DataService.getSchoolMetricsWithFilters({
      academicYear: academicYear || undefined,
      term: term || undefined,
      limit: limit ? parseInt(limit) : 20,
      // offset: offset,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      metrics: result.data || [],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch school metrics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = insertSchoolMetricsSchema.parse(body);

    const result = await DataService.createSchoolMetrics(validatedData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'School metrics created successfully',
        metrics: result.data,
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
      { success: false, message: 'Failed to create school metrics' },
      { status: 500 }
    );
  }
}
