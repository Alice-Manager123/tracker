import { put } from "@vercel/blob";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  auth().protect();
  const form = await req.formData();
  const file = form.get("file");
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  const blob = await put(file.name, file, { access: "public" });
  return NextResponse.json({ url: blob.url, name: file.name });
}