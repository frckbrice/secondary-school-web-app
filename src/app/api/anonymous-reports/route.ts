import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../lib/services/data.service';
import { insertAnonymousReportSchema } from '../../../schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const reportType = searchParams.get('reportType');
    const urgencyLevel = searchParams.get('urgencyLevel');
    const status = searchParams.get('status');

    // Calculate offset from page and limit
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    const offset = (pageNum - 1) * limitNum;

    // Use the new filtered method instead of fetching all data
    const result = await DataService.getAnonymousReportsWithFilters({
      reportType: reportType || undefined,
      urgencyLevel: urgencyLevel || undefined,
      status: status || undefined,
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
      reports: result.data || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        offset,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch anonymous reports' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Convert date string to Date object if provided
    const processedBody = {
      ...body,
      incidentDate: body.incidentDate ? new Date(body.incidentDate) : undefined,
    };

    const validatedData = insertAnonymousReportSchema.parse(processedBody);

    const report = await DataService.createAnonymousReport(validatedData);
    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: 'Failed to create anonymous report' },
      { status: 500 }
    );
  }
}
