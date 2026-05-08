import { renameColumn, deleteColumn } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  auth().protect();
  const { label } = await req.json();
  await renameColumn(Number(params.id), label);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_, { params }) {
  auth().protect();
  await deleteColumn(Number(params.id));
  return NextResponse.json({ ok: true });
}