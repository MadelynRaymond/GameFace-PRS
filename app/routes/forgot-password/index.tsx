import type { ActionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'
import { isProbablyEmail, sendEmail } from '~/util'

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

    return redirect(email)
}

export default function Index() {
    const actionData = useActionData<typeof action>()
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
                <input type="submit" value="Send reset link" />
            </Form>
        </div>
    )
}
