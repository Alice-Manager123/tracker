import { getRecipients, addRecipient, deleteRecipient } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const recipients = await getRecipients(type);
  return NextResponse.json(recipients);
}

export async function POST(req) {
  const { type, email } = await req.json();
  await addRecipient(type, email);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  const { id } = await req.json();
  await deleteRecipient(id);
  return NextResponse.json({ ok: true });
}
