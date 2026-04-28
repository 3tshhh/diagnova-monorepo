import EventEmitter from 'node:events';
import { Resend } from 'resend';

// --- Legacy Gmail/SMTP setup (kept for reference) ---
// import nodemailer from 'nodemailer';
// const transporter = nodemailer.createTransport({
//   service: 'Gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.GOOGLE_APP_PASSWORD,
//   },
//   host: 'smtp.gmail.com',
//   port: 587,
//   secure: false,
// });

const resend = new Resend(process.env.RESEND_API_KEY);

const mailEmitter = new EventEmitter();

mailEmitter.on('sendEmail', (to: string, subject: string, template: string) => {
  const from = process.env.RESEND_FROM || 'onboarding@resend.dev';
  void resend.emails.send({
    from,
    to,
    subject,
    html: template,
  });
});

export const sendEmail = async ({
  to,
  subject,
  template,
}: {
  to: string;
  subject: string;
  template: string;
}) => {
  mailEmitter.emit('sendEmail', to, subject, template);
};
