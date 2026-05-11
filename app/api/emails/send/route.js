import { getRecipients } from "@/lib/db";
import { sendQuoteApprovalEmail, sendInvoiceApprovalEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { type, rowId, poNumber, invoiceNumber } = await req.json();
    const recipients = await getRecipients(type);
    const emails = recipients.map(r => r.email);
    if (!emails.length) return NextResponse.json({ ok: true, skipped: true });
    if (type === "quote") {
      await sendQuoteApprovalEmail({ recipients: emails, poNumber, rowId });
    } else {
      await sendInvoiceApprovalEmail({ recipients: emails, invoiceNumber, rowId });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Email error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
