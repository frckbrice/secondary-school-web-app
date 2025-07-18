import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../lib/services/data.service';
import { insertFileUploadSchema } from '../../../schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uploadedBy = searchParams.get('uploadedBy');
    const relatedType = searchParams.get('relatedType');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    // Only fetch files for the current teacher and grading context
    const result = await DataService.getFileUploadsWithFilters({
      uploadedBy: uploadedBy || undefined,
      relatedType: relatedType || undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      fileUploads: result.data?.data || [],
      pagination: result.data?.pagination,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch file uploads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const relatedType = formData.get('relatedType') as string;
    const relatedId = formData.get('relatedId') as string;
    const uploadedBy = formData.get('uploadedBy') as string;

    console.log('File upload request:', {
      fileName: file?.name,
      fileSize: file?.size,
      relatedType,
      relatedId,
      uploadedBy,
    });

    // Validate required fields
    if (!file || !relatedType || !relatedId || !uploadedBy) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing required fields: file=${!!file}, relatedType=${!!relatedType}, relatedId=${!!relatedId}, uploadedBy=${!!uploadedBy}`,
        },
        { status: 400 }
      );
    }

    // For now, we'll create a simple file upload record without cloudinary
    // TODO: Implement cloudinary upload when the service is available
    const fileUploadData = {
      relatedType,
      relatedId,
      fileName: file.name,
      originalName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      filePath: `/uploads/${file.name}`, // Temporary path
      uploadedBy: uploadedBy ?? '',
    };

    console.log('File upload data before validation:', fileUploadData);

    const validatedData = insertFileUploadSchema.parse(fileUploadData);
    console.log('File upload data after validation:', validatedData);

    const result = await DataService.createFileUpload(validatedData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'File uploaded successfully',
        fileUpload: result.data,
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
      { success: false, message: 'Failed to upload file' },
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
        { success: false, message: 'File ID is required' },
        { status: 400 }
      );
    }

    const result = await DataService.deleteFileUpload(id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
