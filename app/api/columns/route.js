import { getColumns, createColumn } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const cols = await getColumns();
  return NextResponse.json(cols);
}

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { label } = await req.json();
  const col = await createColumn(label);
  return NextResponse.json(col);
}
