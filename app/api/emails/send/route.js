import { getRecipients } from "@/lib/db";
import { sendQuoteApprovalEmail, sendInvoiceApprovalEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req) {
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
}
