import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../lib/services/data.service';
import { insertAchievementSchema } from '../../../schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const isPublished = searchParams.get('isPublished');

    const result = await DataService.getAchievementsWithFilters({
      category: category || undefined,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
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
    return NextResponse.json(
      { success: false, message: 'Failed to fetch achievements' },
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
      date: body.date ? new Date(body.date) : undefined,
    };

    const validated = insertAchievementSchema.parse(processedBody);

    const result = await DataService.createAchievement(validated);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, achievement: result.data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to create achievement' },
      { status: 400 }
    );
  }
}
