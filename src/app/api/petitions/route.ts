import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../lib/services/data.service';
import { CloudinaryService } from '../../../lib/cloudinary';
import { insertPetitionSchema } from '../../../schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const status = searchParams.get('status');
    const petitionType = searchParams.get('petitionType');
    const className = searchParams.get('className');

    // Calculate offset from page and limit
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    const offset = (pageNum - 1) * limitNum;

    // Use the new getPetitionsWithFilters method
    const result = await DataService.getPetitionsWithFilters({
      status: status || undefined,
      petitionType: petitionType || undefined,
      className: className || undefined,
      page: pageNum,
      limit: limitNum,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      petitions: result.data?.data || [],
      pagination: result.data?.pagination,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch petitions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const studentName = formData.get('studentName') as string;
    const studentId = formData.get('studentId') as string;
    const className = formData.get('className') as string;
    const email = formData.get('email') as string;
    const petitionType = formData.get('petitionType') as string;
    const subject = formData.get('subject') as string;
    const term = formData.get('term') as string;
    const academicYear = formData.get('academicYear') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const requestedAction = formData.get('requestedAction') as string;
    const supportingDocuments = formData.getAll(
      'supportingDocuments'
    ) as File[];

    // Validate required fields
    if (
      !studentName ||
      !studentId ||
      !className ||
      !email ||
      !petitionType ||
      !title ||
      !description ||
      !requestedAction
    ) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const documentUrls: string[] = [];

    // Upload supporting documents to Cloudinary if provided
    if (supportingDocuments && supportingDocuments.length > 0) {
      for (const document of supportingDocuments) {
        if (document.size > 0) {
          const arrayBuffer = await document.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const base64Data = `data:${document.type};base64,${buffer.toString('base64')}`;

          const uploadResult = await CloudinaryService.uploadImage(base64Data, {
            folder: 'gbhs-XYZ/petitions/documents',
            public_id: `petition-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
            resource_type: 'raw', // Allow all file types
          });

          documentUrls.push(uploadResult.secure_url);
        }
      }
    }

    // Create petition data
    const petitionData = {
      studentName,
      studentId,
      className,
      email,
      petitionType,
      subject: subject || undefined,
      term: term || undefined,
      academicYear: academicYear || undefined,
      title,
      description,
      requestedAction,
      supportingDocuments: documentUrls.length > 0 ? documentUrls : undefined,
    };

    const validatedData = insertPetitionSchema.parse(petitionData);
    const petition = await DataService.createPetition(validatedData);

    return NextResponse.json(
      {
        ...petition,
        cloudinaryData: documentUrls.length > 0 ? { documentUrls } : null,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: 'Failed to create petition' },
      { status: 500 }
    );
  }
}
