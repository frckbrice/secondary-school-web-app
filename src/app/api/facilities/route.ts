import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../lib/services/data.service';
import { insertFacilitySchema } from '../../../schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const isPublished = searchParams.get('isPublished');

    const result = await DataService.getFacilitiesWithFilters({
      category: category || undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      isPublished: isPublished ? isPublished === 'true' : undefined,
    });
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, ...result.data });
  } catch (error) {
    console.error('Error fetching facilities', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch facilities' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = insertFacilitySchema.parse(body);
    const result = await DataService.createFacility(validated);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, facility: result.data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to create facility' },
      { status: 400 }
    );
  }
}
