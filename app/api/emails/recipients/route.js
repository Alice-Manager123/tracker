import { getRecipients, addRecipient, deleteRecipient } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const recipients = await getRecipients(type);
  return NextResponse.json(recipients);
}

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { type, email } = await req.json();
  await addRecipient(type, email);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await deleteRecipient(id);
  return NextResponse.json({ ok: true });
}
