import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { useEffect, useState } from 'react'
import invariant from 'tiny-invariant'
import { sendEmail } from '~/mailer'
import { createTokenForUser } from '~/models/token.server'
import email from '../$username/profile/change-email/email'

export async function loader({ params }: LoaderArgs) {
    return json({
        email: params.email,
    })
}
export default function Email() {
    const { email } = useLoaderData<typeof loader>()
    // The countdown state is initialized with a value of 15.
    const [countdown, setCountdown] = useState(15)

    // This useEffect hook is used to update the countdown and redirect the user after 15 seconds.
    useEffect(() => {
        // Set a countdown timer to update the countdown value every 1 second using setTimeout.
        if (countdown > 0) {
            const countdownTimer = setTimeout(() => {
                setCountdown(countdown - 1)
            }, 1000)
            return () => clearTimeout(countdownTimer)
        } else {
            window.location.href = `/login`
        }
    }, [countdown, email])

    return (
        <div
            style={{
                height: '75vh',
            }}
            className="form-center"
        >
            <Form method="post">
                <h1> A Password reset link has been sent to: {email}</h1>
                <p style={{ fontSize: '22px' }}>You will be redirected back to your profile in {countdown} seconds.</p>
            </Form>
        </div>
    )
}
