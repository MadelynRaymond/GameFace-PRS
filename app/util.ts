import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'
import { getUserByEmail } from './models/user.server'

export function add(a: number, b: number): number {
    return a + b
}

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

        await transporter.sendMail({
            from: 'GameFace 413 <foo@gamefaceprs.com>',
            to: recipient,
            subject: email.subject,
            text: email.body,
        })
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
        { expiresIn: '10m' }
    )
}

export function isProbablyEmail(email: unknown): email is string {
    return typeof email === 'string' && email.length > 3 && email.includes('@')
}

export function dbTimeToString(dbTime: number): string {
    const minutes = Math.floor(dbTime / 60)
    const seconds = dbTime % 60

    return `${minutes.toString()}:${seconds.toString().padStart(2, '0')}`
}
