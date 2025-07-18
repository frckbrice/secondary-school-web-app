import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '../../../../lib/services/email.service';

export async function POST(request: NextRequest) {
  try {
    const { fileId, recipientEmail, message } = await request.json();
    if (!fileId || !recipientEmail) {
      return NextResponse.json(
        { success: false, message: 'Missing fileId or recipientEmail' },
        { status: 400 }
      );
    }

    // TODO: Validate fileId and recipientEmail, check permissions, etc.

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

    // TODO: Log the share action in the database (optional)

    return NextResponse.json({
      success: true,
      message: 'File shared and email notification sent',
    });
  } catch (error) {
    console.error('Error sharing file:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to share file' },
      { status: 500 }
    );
  }
}
