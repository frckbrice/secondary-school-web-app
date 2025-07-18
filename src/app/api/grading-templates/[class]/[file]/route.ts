import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ class: string; file: string }> }
) {
  try {
    const { class: className, file: fileName } = await context.params;
    if (!className || !fileName) {
      return NextResponse.json(
        { success: false, message: 'Class or file not specified' },
        { status: 400 }
      );
    }

    // Sanitize class name and file name to prevent path traversal
    const safeClass = className.replace(/[^a-zA-Z0-9_-]/g, '');
    const safeFile = fileName.replace(/[^a-zA-Z0-9._-]/g, '');

    const filePath = path.join(
      process.cwd(),
      'public',
      'grading-templates',
      safeClass,
      safeFile
    );

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (err) {
      return NextResponse.json(
        { success: false, message: 'File not found' },
        { status: 404 }
      );
    }

    // Read and serve the file
    const fileBuffer = await fs.readFile(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${safeFile}"`,
      },
    });
  } catch (error) {
    console.error('Error serving template file:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to serve template file',
        error: error?.toString(),
      },
      { status: 500 }
    );
  }
}
