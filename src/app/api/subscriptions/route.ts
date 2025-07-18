import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../lib/services/data.service';
import { insertSubscriptionSchema } from '../../../schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const status = searchParams.get('status');
    const subscriptionType = searchParams.get('subscriptionType');
    const paymentProvider = searchParams.get('paymentProvider');
    const graduationYear = searchParams.get('graduationYear');

    // Calculate offset from page and limit
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    const offset = (pageNum - 1) * limitNum;

    // Use the new filtered method instead of fetching all data
    const result = await DataService.getSubscriptionsWithFilters({
      status: status || undefined,
      subscriptionType: subscriptionType || undefined,
      paymentProvider: paymentProvider || undefined,
      graduationYear: graduationYear || undefined,
      limit: limitNum,
      offset: offset,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      subscriptions: result.data || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        offset,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = insertSubscriptionSchema.parse(body);

    const subscription = await DataService.createSubscription(validatedData);
    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
