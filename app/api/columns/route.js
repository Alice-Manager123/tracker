import { getColumns, createColumn } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const cols = await getColumns();
  return NextResponse.json(cols);
}

export async function POST(req) {
  const { label } = await req.json();
  const col = await createColumn(label);
  return NextResponse.json(col);
}
