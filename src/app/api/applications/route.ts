import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../lib/services/data.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const form = searchParams.get('form') || undefined;
    const email = searchParams.get('email') || undefined;
    const phone = searchParams.get('phone') || undefined;
    const reviewedBy = searchParams.get('reviewedBy')
      ? searchParams.get('reviewedBy')!
      : undefined;
    const page = searchParams.get('page')
      ? parseInt(searchParams.get('page')!)
      : undefined;
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!)
      : undefined;

    const result = await DataService.getApplicationsWithFilters({
      status,
      form,
      email,
      phone,
      reviewedBy,
      page,
      limit,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      applications: result.data?.data || [],
      pagination: result.data?.pagination,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const applicationData = await request.json();

    if (
      !applicationData.firstName ||
      !applicationData.lastName ||
      !applicationData.email ||
      !applicationData.phone ||
      !applicationData.form
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'First name, last name, email, phone, and form are required',
        },
        { status: 400 }
      );
    }

    const result = await DataService.createApplication(applicationData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      application: result.data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
