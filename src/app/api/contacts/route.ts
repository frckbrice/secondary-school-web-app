import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../lib/services/data.service';
import { insertContactSchema } from '../../../schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const status = searchParams.get('status');
    const inquiryType = searchParams.get('inquiryType');
    const respondedBy = searchParams.get('respondedBy');

    // Calculate offset from page and limit
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    const offset = (pageNum - 1) * limitNum;

    // Use the new filtered method instead of fetching all data
    const result = await DataService.getContactsWithFilters({
      status: status || undefined,
      inquiryType: inquiryType || undefined,
      respondedBy: respondedBy || undefined,
      limit: limitNum,
      offset,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      contacts: result.data || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        offset,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const contactData = await request.json();

    if (
      !contactData.name ||
      !contactData.email ||
      !contactData.inquiryType ||
      !contactData.message
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Name, email, inquiry type, and message are required',
        },
        { status: 400 }
      );
    }

    const result = await DataService.createContact(contactData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contact message sent successfully',
      contact: result.data,
    });
  } catch (error: any) {
    console.error('Create contact error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
