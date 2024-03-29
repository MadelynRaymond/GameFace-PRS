import type { ActionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Form, Link, useActionData, useCatch, useTransition } from '@remix-run/react'

import { sendEmail } from '~/mailer'
import { createTokenForUser } from '~/models/token.server'
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

    if (!user) {
        throw new Response('Not Found', { status: 404 })
    }
    const token = await createTokenForUser(email)

    if (!token) {
        throw new Response('Unexpected Error Occured', { status: 500 })
    }

    const resetLink = `http://${process.env.BASE_URL || 'localhost:3000'}/reset-password/link?id=${user.id}&token=${token.token}`

    await sendEmail(
        {
            subject: 'Reset Password',
            reqMsg: 'There was a request to change your Password',
            reqMsg_Body:'If you did not initiate this request, please disregard this email and take no further action. However, if you did, please click on the following link to securely reset your password',
            tok_exp_txt:'This request to change your password will expire after 5 mins',
            body: `
                <a  href="${resetLink}" 
                style="background-color:#df7861; border:2px solid black; color:white; padding:1rem 1.5rem; margin:auto; margin-top:6px; display:block; width:183px; font-family:'Montserrat',sans-serif!important; border-radius:12px; text-align:center; text-decoration:none; font-size:1rem;">
                  Reset Password
                </a>`,
        },
        email,
    )

    return redirect(email)
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
                <h1>Forgot Password</h1>
                <div>
                    <input type="text" name="email" id="email" placeholder="Account Email" />
                    <span className="error-text">{actionData?.error}</span>
                </div>
                <div className="flex gap-3">
                    <input className="btn" disabled={transition.state === 'loading'} type="submit" value="Send reset link" />
                    <Link style={{ color: 'white' }} className="btn" to={`/login`}>
                        Back to login
                    </Link>
                </div>
            </Form>
        </div>
    )
}
//The CatchBoundary component only handles errors that are thrown during rendering
export function CatchBoundary() {
    const caught = useCatch()

    if (caught.status === 404) {
        return (
            <div className="flex justify-center">
                <h2>Email-Address-Error: No Account Exists With Email Address</h2>
            </div>
        )
    }

    throw new Error(`Unexpected caught response with status: ${caught.status}`)
}
