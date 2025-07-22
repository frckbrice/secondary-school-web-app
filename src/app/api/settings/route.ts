import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../src/lib/db';
import { settings } from '../../../../src/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../src/lib/authOptions';

// Helper: get the latest settings row
async function getSettings() {
  try {
    const rows = await db.select().from(settings).orderBy(settings.updatedAt);
    return rows[rows.length - 1] || null;
  } catch (e) {
    throw e;
  }
}

export async function GET() {
  try {
    const current = await getSettings();
    return NextResponse.json(current || {}, { status: 200 });
  } catch (e) {
    console.error('\n\n error getting settings: ', e);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Real admin authentication check
    const session = await getServerSession(authOptions);
    const user = session?.user as any; // or as { role?: string }
    if (!session || !user || !['admin', 'super-admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const data = await req.json();
    let current = await getSettings();
    if (current) {
      await db
        .update(settings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(settings.id, current.id));
    } else {
      await db.insert(settings).values({ ...data, id: data.id || undefined });
    }
    const updated = await getSettings();
    return NextResponse.json(updated, { status: 200 });
  } catch (e) {
    console.error('\n\n error updating settings: ', e);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
