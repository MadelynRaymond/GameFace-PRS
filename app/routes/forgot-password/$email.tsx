import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { sendEmail } from '~/mailer'
import { createTokenForUser } from '~/models/token.server'


export async function loader({ params }: LoaderArgs) {

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
