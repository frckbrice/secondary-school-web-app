import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../../lib/services/data.service';
import { insertAchievementSchema } from '../../../../schema';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await DataService.getAchievementById(id);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, achievement: result.data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch achievement' },
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

    // Convert date string to Date object if provided
    const processedBody = {
      ...body,
      date: body.date ? new Date(body.date) : undefined,
    };

    const validated = insertAchievementSchema.partial().parse(processedBody);
    const result = await DataService.updateAchievement(id, validated);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, achievement: result.data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to update achievement' },
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
    const result = await DataService.deleteAchievement(id);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to delete achievement' },
      { status: 400 }
    );
  }
}
