import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
    const blob = await put(file.name, file, { access: "public", token: process.env.BLOB_READ_WRITE_TOKEN });
    return NextResponse.json({ url: blob.url, name: file.name });
  } catch (error) {
    console.error("Upload error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
