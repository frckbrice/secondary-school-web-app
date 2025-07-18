import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../../lib/services/data.service';
import { insertFacilitySchema } from '../../../../schema';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await DataService.getFacilityById(id);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, facility: result.data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch facility' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = insertFacilitySchema.partial().parse(body);
    const result = await DataService.updateFacility(id, validated);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, facility: result.data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to update facility' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await DataService.deleteFacility(id);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting facility', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete facility' },
      { status: 400 }
    );
  }
}
