import * as nodemailer from 'nodemailer';
import * as mg from 'nodemailer-mailgun-transport';

let emailSender: any;

if (process.env.BACKEND_NODEMAILER_TRANSPORT === 'SMTP') {
  let smtpConfig = {
    host: process.env.BACKEND_SMTP_HOST,
    port: Number(process.env.BACKEND_SMTP_PORT),
    secure: process.env.BACKEND_SMTP_SECURE === 'TRUE' ? true : false, // use SSL
    auth: {
      user: process.env.BACKEND_SMTP_AUTH_USER,
      pass: process.env.BACKEND_SMTP_AUTH_PASSWORD
    }
  };

  emailSender = nodemailer.createTransport(smtpConfig);
  //
} else if (process.env.BACKEND_NODEMAILER_TRANSPORT === 'MAILGUN') {
  const auth = {
    auth: {
      api_key: process.env.BACKEND_MAILGUN_ACTIVE_API_KEY,
      domain: process.env.BACKEND_MAILGUN_DOMAIN
    }
  };

  emailSender = nodemailer.createTransport(mg(auth));
}

export async function sendEmail(item: {
  to: string;
  subject: string;
  text: string;
}) {
  return new Promise((resolve, reject) => {
    emailSender.sendMail(
      {
        from: process.env.BACKEND_SEND_EMAIL_FROM,
        to: item.to,
        subject: item.subject,
        text: item.text
      },
      (err: any, info: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(info);
        }
      }
    );
  });
}
