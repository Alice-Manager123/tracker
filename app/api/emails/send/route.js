import { getRecipients } from "@/lib/db";
import { sendQuoteApprovalEmail, sendInvoiceApprovalEmail } from "@/lib/email";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
