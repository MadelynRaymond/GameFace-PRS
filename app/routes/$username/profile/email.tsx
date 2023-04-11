import type { ActionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Form, Link, useActionData, useCatch, useTransition } from '@remix-run/react'
import jwt from 'jsonwebtoken'
import { createEmailConfirmToken, sendEmail } from '~/mailer'
import { getUserByEmail } from '~/models/user.server'
import { isProbablyEmail } from '~/util'

export async function action({ request }: ActionArgs) {
    const formData = await request.formData()
    const email = formData.get('email')

    if (typeof email !== 'string' || email.length === 0) {
        return json(
            {
                error: 'Email not provided',
            },
            { status: 400 }
        )
    }

    if (!isProbablyEmail(email)) {
        return json(
            {
                error: 'Please enter a valid email',
            },
            { status: 400 }
        )
    }
    const user = await getUserByEmail(email)


    const token = await createEmailConfirmToken(email)
    if (!token) {
        throw new Response('Unexpected Error Occured', { status: 500 })
    }
    // const resetLink = `http://${process.env.BASE_URL || 'localhost:3000'}/reset-password/link?id=${user.id}&token=${token.token}`

    const resetLink = `http://${process.env.BASE_URL || 'localhost:3000'}/confirm-email/link?id=${user?.email}&token=${token}`

    await sendEmail(
        {
            subject: 'Confirm Email Address Change',
            body: `
                <p>We received a request to change the email address for your account on our platform.</p>
                <p>If you made this request, please click the button below to confirm the change:</p>
                <a  href="${resetLink}" 
                style="background-color:#df7861; border:2px solid black; color:white; padding:1rem 1.5rem; margin:auto; margin-top:6px; display:block; width:183px; font-family:'Montserrat',sans-serif!important; border-radius:12px; text-align:center; text-decoration:none; font-size:1rem;">
                  Reset Password
                </a>`,
        },
        email
    )

    return redirect('/confirmation-pending')
}

export default function Index() {
    const actionData = useActionData<typeof action>()
    const transition = useTransition()

    return (
        <div
            style={{
                height: '75vh',
            }}
            className="form-center"
        >
            <Form method="post">
                <h1>Change Email Address</h1>
                <div>
                    <input type="text" name="email" id="email" placeholder="New Email Address" />
                    <span className="error-text">{actionData?.error}</span>
                </div>
                <div className="flex gap-3">
                    <input className="btn" disabled={transition.state === 'loading'} type="submit" value="Send Confirmation Email" />
                    <Link style={{ color: 'white' }} className="btn" to={`/profile`}>
                        Cancel
                    </Link>
                </div>
            </Form>
        </div>
    )
}
