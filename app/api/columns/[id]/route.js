import { renameColumn, deleteColumn } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(req, props) {
  const params = await props.params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { label } = await req.json();
  await renameColumn(Number(params.id), label);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, props) {
  const params = await props.params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await deleteColumn(Number(params.id));
  return NextResponse.json({ ok: true });
}
