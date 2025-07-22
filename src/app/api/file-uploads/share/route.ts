import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '../../../../lib/services/email.service';
import { DataService } from '../../../../lib/services/data.service';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { fileId, recipientEmail, message } = await request.json();
    if (!fileId || !recipientEmail) {
      return NextResponse.json(
        { success: false, message: 'Missing fileId or recipientEmail' },
        { status: 400 }
      );
    }

    // Validate fileId and recipientEmail
    if (!fileId || typeof fileId !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Invalid file ID' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if file exists and get file details
    const fileResult = await DataService.getFileUploadById(fileId);
    if (!fileResult.success || !fileResult.data) {
      return NextResponse.json(
        { success: false, message: 'File not found' },
        { status: 404 }
      );
    }

    const fileData = fileResult.data;

    // Construct the correct file path based on how files are stored
    // Files are stored in: uploads/teacher-grades/{uploadedBy}/{fileName}
    const filePath = path.join(
      process.cwd(),
      'uploads',
      'teacher-grades',
      fileData.uploadedBy,
      path.basename(fileData.filePath)
    );

    console.log('Looking for file at:', filePath);

    // Check if file exists on disk
    try {
      await fs.access(filePath);
    } catch (error) {
      console.error('File not found at path:', filePath);
      return NextResponse.json(
        { success: false, message: 'File not found on disk' },
        { status: 404 }
      );
    }

    // Read file content for attachment
    const fileBuffer = await fs.readFile(filePath);

    // Determine content type based on file extension
    const getContentType = (filename: string) => {
      const ext = path.extname(filename).toLowerCase();
      switch (ext) {
        case '.xlsx':
          return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        case '.xls':
          return 'application/vnd.ms-excel';
        case '.pdf':
          return 'application/pdf';
        case '.doc':
          return 'application/msword';
        case '.docx':
          return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        default:
          return 'application/octet-stream';
      }
    };

    // Send email with attachment
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">📊 Grading File Shared</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">A teacher has shared a grading file with you</p>
          </div>
          
          <div style="background: white; padding: 20px; border: 1px solid #e1e5e9; border-top: none; border-radius: 0 0 10px 10px;">
            <div style="background: #f8f9fa; border-left: 4px solid #007bff; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
              <h3 style="margin: 0 0 10px 0; color: #333;">📁 File Details</h3>
              <p style="margin: 0; color: #666;"><strong>File Name:</strong> ${fileData.fileName}</p>
              <p style="margin: 5px 0 0 0; color: #666;"><strong>Shared:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            ${
              message
                ? `
              <div style="background: #e8f5e8; border-left: 4px solid #28a745; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
                <h4 style="margin: 0 0 10px 0; color: #155724;">💬 Message from Teacher</h4>
                <p style="margin: 0; color: #155724; font-style: italic;">"${message}"</p>
              </div>
            `
                : ''
            }
            
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
              <h4 style="margin: 0 0 10px 0; color: #856404;">📎 File Attached</h4>
              <p style="margin: 0; color: #856404;">The grading file has been attached to this email. You can download it directly without needing to log in to any system.</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #666; font-size: 14px;">
                This file was shared from the  "" School Management System.<br>
                If you have any questions, please contact the school administration.
              </p>
            </div>
          </div>
        </div>
      `;

      await sendEmail({
        to: recipientEmail,
        subject: `📊 Grading File Shared: ${fileData.fileName}`,
        html: emailHtml,
        text: `A grading file has been shared with you.\n\nFile: ${fileData.fileName}\nShared: ${new Date().toLocaleDateString()}\n\n${message ? `Message: ${message}\n\n` : ''}The file is attached to this email. You can download it directly without needing to log in.\n\nThis file was shared from the  "" School Management System.`,
        attachments: [
          {
            filename: fileData.fileName,
            content: fileBuffer,
            contentType: getContentType(fileData.fileName),
          },
        ],
      });
    } catch (emailError) {
      console.error('Email error:', emailError);
      return NextResponse.json(
        { success: false, message: 'Failed to send email notification' },
        { status: 500 }
      );
    }

    // Log the share action in the database
    try {
      // Create a share log entry (you can create a separate table for this)
      console.log(
        `File ${fileId} shared with ${recipientEmail} at ${new Date().toISOString()}`
      );
      // TODO: Create a file_shares table to log all share actions
    } catch (logError) {
      console.error('Failed to log share action:', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'File shared and email with attachment sent',
      fileDetails: {
        fileName: fileData.fileName,
        sharedAt: new Date().toISOString(),
        recipientEmail,
      },
    });
  } catch (error) {
    console.error('Error sharing file:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to share file' },
      { status: 500 }
    );
  }
}
