import { json } from '@remix-run/node'
import type { LoaderArgs } from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { requireUser } from '~/session.server'

export async function loader({ request }: LoaderArgs) {
    const user = await requireUser(request)
    const { email, username } = user
    return json({
        email,
        username,
    })
}

export default function ChangeEmail() {
    const { username, email } = useLoaderData<typeof loader>()
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
            window.location.href = `/${username}/profile`
        }
    }, [countdown, username])

    return (
        <div
            style={{
                height: '75vh',
            }}
            className="form-center"
        >
            <Form method="post">
                <h1>A link to change your account email has been sent to: {email}</h1>
                <p style={{ fontSize: '22px' }}>You will be redirected back to your profile in {countdown} seconds.</p>
            </Form>
        </div>
    )
}
