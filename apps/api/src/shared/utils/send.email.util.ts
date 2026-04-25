import nodemailer from 'nodemailer';
import EventEmitter from 'node:events';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
});

const mailEmitter = new EventEmitter();

mailEmitter.on('sendEmail', (to: string, subject: string, template: string) => {
  void transporter.sendMail({
    from: process.env.EMAIL_USER || 'Project App',
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
