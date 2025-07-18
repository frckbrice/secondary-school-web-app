import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ class: string }> }
) {
  try {
    const { class: className } = await context.params;
    if (!className) {
      return NextResponse.json(
        { success: false, message: 'Class not specified' },
        { status: 400 }
      );
    }
    // Sanitize class name to prevent path traversal
    const safeClass = className.replace(/[^a-zA-Z0-9_-]/g, '');
    const templatesDir = path.join(
      process.cwd(),
      'public',
      'grading-templates',
      safeClass
    );
    let files: string[] = [];
    try {
      files = await fs.readdir(templatesDir);
      // Only return .xlsx files
      files = files.filter(f => f.endsWith('.xlsx'));
    } catch (err) {
      // Directory may not exist
      return NextResponse.json({ success: true, templates: [] });
    }
    return NextResponse.json({ success: true, templates: files });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to list templates',
        error: error?.toString(),
      },
      { status: 500 }
    );
  }
}
