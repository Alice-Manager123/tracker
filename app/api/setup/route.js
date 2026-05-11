import { setupDB } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  await setupDB();
  return NextResponse.json({ ok: true });
}

export async function POST() {
  await setupDB();
  return NextResponse.json({ ok: true });
}
