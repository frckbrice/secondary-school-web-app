import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '../../../../lib/services/email.service';
import { DataService } from '../../../../lib/services/data.service';

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
    if (!fileResult.success) {
      return NextResponse.json(
        { success: false, message: 'File not found' },
        { status: 404 }
      );
    }

    // Send email notification
    try {
      await sendEmail({
        to: recipientEmail,
        subject: 'A grading file has been shared with you',
        text:
          message ||
          'A grading file has been shared with you. Please log in to view/download.',
      });
    } catch (emailError) {
      return NextResponse.json(
        { success: false, message: 'Failed to send email notification' },
        { status: 500 }
      );
    }

    // Log the share action in the database
    try {
      // Create a share log entry (you can create a separate table for this)
      console.log(`File ${fileId} shared with ${recipientEmail} at ${new Date().toISOString()}`);
      // TODO: Create a file_shares table to log all share actions
    } catch (logError) {
      console.error('Failed to log share action:', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'File shared and email notification sent',
      fileDetails: {
        fileName: fileResult.data?.fileName,
        sharedAt: new Date().toISOString(),
        recipientEmail
      }
    });
  } catch (error) {
    console.error('Error sharing file:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to share file' },
      { status: 500 }
    );
  }
}
