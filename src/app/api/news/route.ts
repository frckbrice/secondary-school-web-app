import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../lib/services/data.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isPublished = searchParams.get('isPublished');
    const category = searchParams.get('category');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const search = searchParams.get('search');

    const published = isPublished ? isPublished === 'true' : undefined;
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;

    const result = await DataService.getNewsWithFilters({
      isPublished: published,
      category: category || undefined,
      page: pageNum,
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
      news: result.data?.data || [],
      pagination: result.data?.pagination,
    });
  } catch (error: any) {
    console.error('Get news error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const newsData = await request.json();

    if (!newsData.title || !newsData.content) {
      return NextResponse.json(
        { success: false, message: 'Title and content are required' },
        { status: 400 }
      );
    }

    const result = await DataService.createNews(newsData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'News created successfully',
      news: result.data,
    });
  } catch (error: any) {
    console.error('Create news error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'News ID is required' },
        { status: 400 }
      );
    }

    const result = await DataService.deleteNews(id);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'News deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete news error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
