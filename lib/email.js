import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendQuoteApprovalEmail({ recipients, poNumber, rowId }) {
  const rowLink = `${BASE_URL}/tracker?row=${rowId}`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: recipients.join(", "),
    subject: `Quote Awaiting Approval — PO #${poNumber || "N/A"}`,
    text: [
      `Dear Recipient,`,
      ``,
      `PO #${poNumber || "N/A"} is awaiting approval.`,
      ``,
      `Please review it here: ${rowLink}`,
      ``,
      `Thank you.`,
    ].join("\n"),
    html: `
      <p>Dear Recipient,</p>
      <p>PO #<strong>${poNumber || "N/A"}</strong> is awaiting approval.</p>
      <p><a href="${rowLink}">Click here to review the record</a></p>
      <p>Thank you.</p>
    `,
  });
}

export async function sendInvoiceApprovalEmail({ recipients, invoiceNumber, rowId }) {
  const rowLink = `${BASE_URL}/tracker?row=${rowId}`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: recipients.join(", "),
    subject: `Invoice Ready for Payment — Invoice #${invoiceNumber || "N/A"}`,
    text: [
      `Dear Accounting,`,
      ``,
      `Invoice #${invoiceNumber || "N/A"} is approved and ready for payment.`,
      ``,
      `Please review it here: ${rowLink}`,
      ``,
      `Thank you.`,
    ].join("\n"),
    html: `
      <p>Dear Accounting,</p>
      <p>Invoice #<strong>${invoiceNumber || "N/A"}</strong> is approved and ready for payment.</p>
      <p><a href="${rowLink}">Click here to review the record</a></p>
      <p>Thank you.</p>
    `,
  });
}