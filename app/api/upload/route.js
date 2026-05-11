import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUrl = "data:application/pdf;base64," + base64;
    return NextResponse.json({ url: dataUrl, name: file.name });
  } catch (error) {
    console.error("Upload error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
