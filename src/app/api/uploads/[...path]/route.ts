import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    try {
        const filePath = join(process.cwd(), 'uploads', ...params.path);

        // Check if file exists
        if (!existsSync(filePath)) {
            return NextResponse.json(
                { success: false, message: 'File not found' },
                { status: 404 }
            );
        }

        // Read file
        const fileBuffer = await readFile(filePath);

        // Determine content type based on file extension
        const ext = filePath.split('.').pop()?.toLowerCase();
        let contentType = 'application/octet-stream';

        if (ext === 'xlsx') {
            contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        } else if (ext === 'xls') {
            contentType = 'application/vnd.ms-excel';
        } else if (ext === 'csv') {
            contentType = 'text/csv';
        } else if (ext === 'pdf') {
            contentType = 'application/pdf';
        }

        // Return file with appropriate headers
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `inline; filename="${params.path[params.path.length - 1]}"`,
            },
        });
    } catch (error) {
        console.error('Error serving file:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to serve file' },
            { status: 500 }
        );
    }
} 