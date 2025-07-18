import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../lib/services/data.service';
import { insertContributionSchema } from '../../../schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const status = searchParams.get('status');
    const paymentProvider = searchParams.get('paymentProvider');
    const isAlumni = searchParams.get('isAlumni');
    const graduationYear = searchParams.get('graduationYear');

    // Calculate offset from page and limit
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    const offset = (pageNum - 1) * limitNum;

    // Use the new filtered method instead of fetching all data
    const result = await DataService.getContributionsWithFilters({
      status: status || undefined,
      paymentProvider: paymentProvider || undefined,
      isAlumni: isAlumni ? isAlumni === 'true' : undefined,
      graduationYear: graduationYear || undefined,
      limit: limitNum,
      offset: offset,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      contributions: result.data || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        offset,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch contributions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = insertContributionSchema.parse(body);

    const result = await DataService.createContribution(validatedData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Contribution created successfully',
        contribution: result.data,
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
      { success: false, message: 'Failed to create contribution' },
      { status: 500 }
    );
  }
}
