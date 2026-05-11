import { getRows, createRow } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await getRows();
  return NextResponse.json(rows);
}

export async function POST() {
  const row = await createRow();
  return NextResponse.json(row);
}
