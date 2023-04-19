import type { LoaderArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Form, useLoaderData, useSubmit } from '@remix-run/react'
import { useEffect, useState } from 'react'
import invariant from 'tiny-invariant'
import { sendEmail } from '~/mailer'
import { createTokenForUser } from '~/models/token.server'
import email from '../$username/profile/change-email/email'
import { action } from '.'

export async function loader({ params }: LoaderArgs) {
    return json({
        email: params.email,
    })
}
export default function Email() {
    const { email } = useLoaderData<typeof loader>()
    const submit = useSubmit()
    const [countdown, setCountdown] = useState(5)

    useEffect(() => {
        if (countdown < 1) {
            submit(null, { action: '/login', method: 'get', replace: true})
        }
        const countdownTimer = setTimeout(() => {
            setCountdown((countdown) => countdown - 1)
        }, 1000)
        return () => clearTimeout(countdownTimer)
    }, [countdown])

    return (
        <div style={{ height: '75vh' }} className="form-center">
            <div>
                <h1> A Password reset link has been sent to: {email}</h1>
                <p style={{ fontSize: '22px' }}>You will now be redirected to the login page in {countdown} seconds.</p>
            </div>
        </div>
    )
}
