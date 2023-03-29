import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'
import { getUserByEmail } from './models/user.server'
import { passwordResetHtml } from './email-template'
<<<<<<< HEAD
>>>>>>> c65fe80 (Seperated ResetPassEmailTemp)
=======
>>>>>>> c65fe80 (Seperated ResetPassEmailTemp)

export async function sendEmail(
    email: {
        subject: string
        body: string
    },
    recipient: string
) {
    try {

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_TRANSPORT_HOST,
                pass: process.env.EMAIL_APP_PASSWORD,
            },
        })

        transporter.verify(function (error, success) {
            if (error) {
                console.log(error)
            } else {
                console.log('Server is ready to take our messages')
            }
        })
<<<<<<< HEAD
// 900 x 1463.5
// 600 x 1453.5
        await transporter.sendMail({
            from: 'GameFace 413 <foo@gamefaceprs.com>',
            to: recipient,
            subject: email.subject,
            text: email.body,
            //This need to include flexbox from Scss and fix padding/margin/align content as well as email link not being in one line(embed)
            html: 
            `<div style="background-color: #e6e6e6; width: 100%; height: 1463.5px; padding: 20px;">
            <div style="background-color: #ffffff; width: 600px; height: 785.5px; padding: 20px; margin: auto;">
              <div style="text-align: center;">
                <img src="https://static.wixstatic.com/media/b0e244_4c7a1af456f447cea4b26dade5e2d182~mv2_d_1280_1280_s_2.png/v1/fill/w_564,h_564,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/GameFace413_Logo_FINAL.png" alt="GameFace413 Logo" style="max-width: 125px;">
              </div>
              <div style="padding-top: 20px; padding: 55px 12.5% 40px 12.5%;">
                <h2 style="font-size: 18px; font-weight:100; text-decoration: none; color: #333;">Hi <span style="color: #333; text-decoration: none;"> ${recipient},</span></h2>
                <p style="color: #333; margin: 0 0 27px 0;line-height: 27px; font-size:20px;margin-top:43px;">There was a request to change your password! If you did not make this request then please ignore this email. Otherwise, please click the link to change your password:<br></px>
                <div>${email.body}</div>

              
                </div>
            </div>
          </div>
        `

        })
=======

const passwordResetEmailHtml = await passwordResetHtml(recipient, email.body);

        transporter.sendMail({
            
            from: 'GameFace 413 <foo@gamefaceprs.com>',
            to: recipient,
            subject: email.subject,
            html: passwordResetEmailHtml,

        });
>>>>>>> c65fe80 (Seperated ResetPassEmailTemp)
    } catch (error: unknown) {
        if (error instanceof Error) {
            return error
        } else {
            return new Error('unknown error')
        }
    }
}

//TODO: change secret
export async function createResetToken(userEmail: string): Promise<string | undefined> {
    const user = await getUserByEmail(userEmail)
    if (!user) {
        return undefined
    }

    return jwt.sign(
        {
            data: {
                userId: user.id,
            },
        },
        'SECRET',
        { expiresIn: '5m' }
    )
}
