
import { getColumns, createColumn } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  auth().protect();
  const cols = await getColumns();
  return NextResponse.json(cols);
}

export async function POST(req) {
  auth().protect();
  const { label } = await req.json();
  const col = await createColumn(label);
  return NextResponse.json(col);
}