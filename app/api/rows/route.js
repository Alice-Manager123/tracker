import { getRows, createRow } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  auth().protect();
  const rows = await getRows();
  return NextResponse.json(rows);
}

export async function POST() {
  auth().protect();
  const row = await createRow();
  return NextResponse.json(row);
}
