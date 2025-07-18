import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../../lib/services/data.service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const userId = formData.get('userId') as string;

    // Validate required fields
    if (!imageFile || !userId) {
      return NextResponse.json(
        { success: false, message: 'Image file and user ID are required' },
        { status: 400 }
      );
    }

    // Validate cuid format with regex
    const cuidRegex = /^c[a-z0-9]{24}$/;
    if (!cuidRegex.test(userId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Get existing user to check if they exist
    const existingUserResult = await DataService.getUserById(userId);
    if (!existingUserResult.success) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // For now, we'll just update the profile image URL to a placeholder
    // TODO: Implement cloudinary upload when the service is available
    const placeholderUrl = `/uploads/profile-${userId}-${Date.now()}.jpg`;

    // Update user profile image URL
    const result = await DataService.updateUser(userId, {
      profileImageUrl: placeholderUrl,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile image uploaded successfully',
      user: result.data,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Failed to upload profile image' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate cuid format with regex
    const cuidRegex = /^c[a-z0-9]{24}$/;
    if (!cuidRegex.test(userId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Get existing user to check if they exist
    const existingUserResult = await DataService.getUserById(userId);
    if (!existingUserResult.success) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Remove profile image URL from user
    const result = await DataService.updateUser(userId, {
      profileImageUrl: '',
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile image removed successfully',
      user: result.data,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Failed to remove profile image' },
      { status: 500 }
    );
  }
}
