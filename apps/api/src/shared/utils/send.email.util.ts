import nodemailer from 'nodemailer';

function createTransporter() {
  return nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.GOOGLE_APP_PASSWORD,
    },
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
  });
}

export const sendEmail = async ({
  to,
  subject,
  template,
}: {
  to: string;
  subject: string;
  template: string;
}) => {
  const transporter = createTransporter();
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: template,
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
