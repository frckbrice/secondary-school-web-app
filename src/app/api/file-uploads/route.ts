import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../lib/services/data.service';
import { insertFileUploadSchema } from '../../../schema';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

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

    // Transform the data to match frontend expectations
    const transformedUploads = (result.data?.data || []).map(upload => ({
      id: upload.id,
      name: upload.fileName,
      url: upload.filePath,
      uploadedAt: upload.createdAt,
      uploadedBy: upload.uploadedBy,
      fileSize: upload.fileSize,
      mimeType: upload.mimeType,
      originalName: upload.originalName,
    }));

    return NextResponse.json({
      success: true,
      fileUploads: transformedUploads,
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

    // Save file to disk
    const uploadDir = join(
      process.cwd(),
      'uploads',
      'teacher-grades',
      uploadedBy
    );
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = join(uploadDir, fileName);

    try {
      // Create directory if it doesn't exist
      await mkdir(uploadDir, { recursive: true });

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      // Create database record
      const fileUploadData = {
        relatedType,
        relatedId,
        fileName: file.name,
        originalName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        filePath: `/uploads/teacher-grades/${uploadedBy}/${fileName}`,
        uploadedBy: uploadedBy ?? '',
      };

      const validatedData = insertFileUploadSchema.parse(fileUploadData);

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
  } catch (error) {
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
