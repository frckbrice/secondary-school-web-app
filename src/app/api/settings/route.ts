import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../src/lib/db';
import { settings } from '../../../../src/schema';
import { eq } from 'drizzle-orm';

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
    console.error("\n\n error getting settings: ", e);
    return null;
  }
}

export async function PUT(req: NextRequest) {
  // TODO: Add real admin authentication check
  // For now, allow all PUTs
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
}
