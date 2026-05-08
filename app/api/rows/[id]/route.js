import { upsertCell, deleteRow } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  auth().protect();
  const { colKey, value } = await req.json();
  await upsertCell(Number(params.id), colKey, value);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_, { params }) {
  auth().protect();
  await deleteRow(Number(params.id));
  return NextResponse.json({ ok: true });
}