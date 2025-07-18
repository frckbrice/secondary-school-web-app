import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../lib/services/data.service';
import { CloudinaryService } from '../../../lib/cloudinary';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isPublished = searchParams.get('published');

    const published = isPublished ? isPublished === 'true' : undefined;
    const result = await DataService.getAllEvents(published);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      events: result.data,
    });
  } catch (error: any) {
    console.error('Get events error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json();

    if (!eventData.title || !eventData.description || !eventData.eventDate) {
      return NextResponse.json(
        {
          success: false,
          message: 'Title, description, and event date are required',
        },
        { status: 400 }
      );
    }

    const result = await DataService.createEvent(eventData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Event created successfully',
      event: result.data,
    });
  } catch (error: any) {
    console.error('Create event error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const imageFile = formData.get('image') as File;
    const title = formData.get('title') as string;
    const titleFr = formData.get('titleFr') as string;
    const description = formData.get('description') as string;
    const descriptionFr = formData.get('descriptionFr') as string;
    const eventDate = formData.get('eventDate') as string;
    const location = formData.get('location') as string;
    const category = formData.get('category') as string;
    const isPublished = formData.get('isPublished') === 'true';

    if (!id) {
      return NextResponse.json(
        { message: 'Event ID is required' },
        { status: 400 }
      );
    }

    const cuidRegex = /^c[a-z0-9]{24}$/;
    if (!cuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid event ID format' },
        { status: 400 }
      );
    }

    // Get existing event to check if it has an image
    const existingEvent = await DataService.getEventById(id);
    if (!existingEvent) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    let imageUrl = existingEvent.data?.imageUrl || '';

    // Upload new image to Cloudinary if provided
    if (imageFile) {
      // Delete old image from Cloudinary if it exists
      if (existingEvent.data?.imageUrl) {
        const urlParts = existingEvent.data.imageUrl.split('/');
        const publicId = urlParts[urlParts.length - 1].split('.')[0];
        await CloudinaryService.deleteImage(publicId);
      }

      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Data = `data:${imageFile.type};base64,${buffer.toString('base64')}`;

      const uploadResult = await CloudinaryService.uploadImage(base64Data, {
        folder: 'gbhs-bafia/events',
        public_id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
      });

      imageUrl = uploadResult.secure_url;
    }

    // Update event data
    const updateData: any = {};
    if (title) updateData.title = title;
    if (titleFr !== undefined) updateData.titleFr = titleFr || undefined;
    if (description) updateData.description = description;
    if (descriptionFr !== undefined)
      updateData.descriptionFr = descriptionFr || undefined;
    if (eventDate) updateData.eventDate = new Date(eventDate);
    if (location !== undefined) updateData.location = location || undefined;
    if (category) updateData.category = category;
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    if (imageUrl) updateData.imageUrl = imageUrl;

    const updatedEvent = await DataService.updateEvent(id, updateData);
    if (!updatedEvent) {
      return NextResponse.json(
        { message: 'Failed to update event' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...updatedEvent,
      cloudinaryData: imageFile ? { secure_url: imageUrl } : null,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: 'Failed to update event' },
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
        { message: 'Event ID is required' },
        { status: 400 }
      );
    }

    const success = await DataService.deleteEvent(id);
    if (!success) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
