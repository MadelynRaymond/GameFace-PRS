import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { createTokenForUser } from '~/models/token.server'
import { sendEmail } from '~/util'

export async function loader({ request, params }: LoaderArgs) {
    invariant(params.email, 'No email provided')
    const token = await createTokenForUser(params.email)
    if (!token) {
        throw new Response('not found', { status: 404 })
    }
    const resetLink = `http://10.0.0.246:3000/reset-password/${params.email}&${token.token}`
    await sendEmail(
        {
            subject: 'Reset Password',
            body: resetLink,
        },
        params.email
    )

    return json({
        email: params.email,
    })
}
export default function Email() {
    const { email } = useLoaderData<typeof loader>()
    return (
        <div>
            <h1>Password reset link sent to: {email}</h1>
        </div>
    )
}
