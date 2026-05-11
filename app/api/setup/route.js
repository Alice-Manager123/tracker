import { setupDB, addPropertyColumn } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  await setupDB();
  await addPropertyColumn();
  return NextResponse.json({ ok: true });
}

export async function POST() {
  await setupDB();
  await addPropertyColumn();
  return NextResponse.json({ ok: true });
}
