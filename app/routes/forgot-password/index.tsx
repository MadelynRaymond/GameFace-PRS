import type { ActionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Form, useActionData, useTransition } from '@remix-run/react'

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
    if (!user) {
        throw new Response('Not Found', { status: 404 })
    }
    const token = await createTokenForUser(email)

    if (!token) {
        throw new Response('Unexpected Error Occured', { status: 500 })
    }
    if (!token) {
        throw new Response('Unexpected Error Occured', { status: 500 })
    }


    const resetLink = `http://${process.env.BASE_URL || 'localhost:3000'}/reset-password/link?id=${user.id}&token=${token.token}`

    await sendEmail(
        {
            subject: 'Reset Password',
            body: `<p>Please click the button below to reset your password:</p>
                <a href="${resetLink}" 
                style="background-color:#DF7861;border:2px solid black;color:white;padding:1rem 1.5rem;margin:auto;margin-top:84px;display:block;width:200px;font-family:'Montserrat',sans-serif!important;border-radius:50px;transition-duration:0.1s;transition-timing-function:ease-in;box-shadow:4px 4px 0 black;text-align:center;text-decoration:none;">
                  Reset Password
                </a>`,
        },
        email
    )

    return redirect(email)
}
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
                <input type="text" name="email" id="email" placeholder="Account Email" />
                <span className="error-text">{actionData?.error}</span>
                <input className="btn" disabled={transition.state === 'loading'} type="submit" value="Send reset link" />
            </Form>
        </div>
    )
}
