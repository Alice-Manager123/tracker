import { renameColumn, deleteColumn } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(req, props) {
  const params = await props.params;
  const { label } = await req.json();
  await renameColumn(Number(params.id), label);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, props) {
  const params = await props.params;
  await deleteColumn(Number(params.id));
  return NextResponse.json({ ok: true });
}
