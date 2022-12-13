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

    if (!user) {
        throw new Response("Not Found", {status: 404})
    }
    const token = await createTokenForUser(email)

    if (!token) {
        throw new Response("Unexpected Error Occured", {status: 500})
    }
    

    const resetLink = `http://${process.env.BASE_URL}/reset-password/link?id=${user.id}&token=${token.token}`
    await sendEmail(
        {
            subject: 'Reset Password',
            body: resetLink,
        },
        email
    )

    return redirect(email)
}

export default function Index() {
    const actionData = useActionData<typeof action>()
    const transition = useTransition();
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
                <input className='btn' disabled={transition.state === 'loading'} type="submit" value="Send reset link" />
            </Form>
        </div>
    )
}
