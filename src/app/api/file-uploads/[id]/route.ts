import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../../lib/services/data.service';
import fs from 'fs/promises';
import path from 'path';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: fileId } = await params;

    if (!fileId) {
      return NextResponse.json(
        { success: false, message: 'File ID is required' },
        { status: 400 }
      );
    }

    // Get file details from database
    const fileResult = await DataService.getFileUploadById(fileId);
    if (!fileResult.success || !fileResult.data) {
      return NextResponse.json(
        { success: false, message: 'File not found' },
        { status: 404 }
      );
    }

    const fileData = fileResult.data;

    // Construct the file path
    const filePath = path.join(
      process.cwd(),
      'uploads',
      'teacher-grades',
      fileData.uploadedBy,
      path.basename(fileData.filePath)
    );

    // Delete file from disk
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file from disk:', error);
      // Continue with database deletion even if file doesn't exist on disk
    }

    // Delete from database
    const deleteResult = await DataService.deleteFileUpload(fileId);
    if (!deleteResult.success) {
      return NextResponse.json(
        { success: false, message: 'Failed to delete file from database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
