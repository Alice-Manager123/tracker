import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const BASE_URL = 'https://tracker-six-opal.vercel.app';

export async function sendQuoteApprovalEmail({ recipients, poNumber, rowId }) {
  const rowLink = BASE_URL + '/tracker?row=' + rowId;
  await resend.emails.send({
    from: 'Bellridge Tracker <noreply@bellridgemg.com>',
    to: recipients,
    subject: 'Quote Awaiting Approval - PO #' + (poNumber || 'N/A'),
    html: '<p>Dear Recipient,</p><p>PO #<strong>' + (poNumber || 'N/A') + '</strong> is awaiting approval.</p><p><a href=' + rowLink + '>Click here to review</a></p>'
  });
}

export async function sendInvoiceApprovalEmail({ recipients, invoiceNumber, rowId }) {
  const rowLink = BASE_URL + '/tracker?row=' + rowId;
  await resend.emails.send({
    from: 'Bellridge Tracker <noreply@bellridgemg.com>',
    to: recipients,
    subject: 'Invoice Ready for Payment - Invoice #' + (invoiceNumber || 'N/A'),
    html: '<p>Dear Accounting,</p><p>Invoice #<strong>' + (invoiceNumber || 'N/A') + '</strong> is ready for payment.</p><p><a href=' + rowLink + '>Click here to review</a></p>'
  });
}
