import nodemailer from 'nodemailer';
import { Resend } from 'resend';

const useResend = !!process.env.RESEND_API_KEY;
const resend = useResend ? new Resend(process.env.RESEND_API_KEY) : null;
const fromAddr = process.env.EMAIL_FROM || 'Sun City Paris <hello@suncity-paris.fr>';

const smtpTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mailpit',
  port: Number(process.env.SMTP_PORT || 1025),
  secure: false,
  auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! } : undefined,
});

export async function sendMail(opts: { to: string; subject: string; html: string; text?: string }) {
  const { to, subject, html, text } = opts;
  if (useResend) {
    await resend!.emails.send({ from: fromAddr, to, subject, html, text });
  } else {
    await smtpTransporter.sendMail({ from: fromAddr, to, subject, html, text });
  }
}
