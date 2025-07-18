import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../lib/services/data.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isPublished = searchParams.get('published');
    const category = searchParams.get('category');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    const published = isPublished ? isPublished === 'true' : undefined;
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;

    const result = await DataService.getGalleryWithFilters({
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
      gallery: result.data?.data || [],
      pagination: result.data?.pagination,
    });
  } catch (error: any) {
    console.error('Get gallery error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const galleryData = await request.json();

    if (!galleryData.title || !galleryData.imageUrl || !galleryData.category) {
      return NextResponse.json(
        {
          success: false,
          message: 'Title, image URL, and category are required',
        },
        { status: 400 }
      );
    }

    const result = await DataService.createGalleryImage(galleryData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Gallery image created successfully',
      gallery: result.data,
    });
  } catch (error: any) {
    console.error('Create gallery image error:', error);
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
        { message: 'Gallery item ID is required' },
        { status: 400 }
      );
    }

    const cuidRegex = /^c[a-z0-9]{24}$/;
    if (!cuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid gallery item ID format' },
        { status: 400 }
      );
    }

    await DataService.deleteGalleryImage(id);

    return NextResponse.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to delete gallery item' },
      { status: 500 }
    );
  }
}
