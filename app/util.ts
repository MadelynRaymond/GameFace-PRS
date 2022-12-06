import nodemailer from 'nodemailer'

export function add(a: number, b: number): number {
  return a + b
}


export async function sendEmail(email: {subject: string, body: string}, recipient: string) {
  try {

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_TRANSPORT_HOST,
        pass: process.env.EMAIL_APP_PASSWORD
      },
    });

    transporter.verify(function (error, success) {
      if (error) {
        console.log(error);
      } else {
        console.log("Server is ready to take our messages");
      }
    });

    await transporter.sendMail({
      from: 'GameFace 413 <foo@gamefaceprs.com>',
      to: recipient,
      subject: email.subject,
      text: email.body,
    })
  }

  catch (error: unknown) {
    if (error instanceof Error) {
      return error
    }
    else {
      return new Error("unknown error")
    }
  }
}

export async function createResetToken(userId: number) {
  
}

export function isProbablyEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}