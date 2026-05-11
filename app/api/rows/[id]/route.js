import { upsertCell, deleteRow } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(req, props) {
  const params = await props.params;
  const { colKey, value } = await req.json();
  await upsertCell(Number(params.id), colKey, value);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_, props) {
  const params = await props.params;
  await deleteRow(Number(params.id));
  return NextResponse.json({ ok: true });
}
