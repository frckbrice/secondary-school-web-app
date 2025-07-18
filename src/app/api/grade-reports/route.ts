import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../lib/services/data.service';
import { insertGradeReportSchema } from '../../../schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const academicYear = searchParams.get('academicYear');
    const term = searchParams.get('term');

    const result = await DataService.getGradeReports({
      teacherId: teacherId || undefined,
      academicYear: academicYear || undefined,
      term: term || undefined,
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
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch grade reports' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = insertGradeReportSchema.parse(body);

    const result = await DataService.createGradeReport(validatedData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Grade report created successfully',
        report: result.data,
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
      { success: false, message: 'Failed to create grade report' },
      { status: 500 }
    );
  }
}
