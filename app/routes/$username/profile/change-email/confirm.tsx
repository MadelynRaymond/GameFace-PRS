import { LoaderArgs, json } from '@remix-run/node'
import { Form, useLoaderData, useSubmit } from '@remix-run/react'
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

export default function ChangeEmailRedirect() {
    const { email } = useLoaderData<typeof loader>()
    const submit = useSubmit()

    const [countdown, setCountdown] = useState(5)

    useEffect(() => {
        if (countdown < 1) {
            submit(null, { action: '/logout', method: 'post', replace: true })

        }
        const countdownTimer = setTimeout(() => {
            setCountdown((countdown) => countdown - 1)
        }, 1000)

        return () => clearTimeout(countdownTimer)
    }, [countdown])


    return (
        <div style={{ height: '75vh' }} className="form-center">
            <div>
                <h1>A link to change your account email has been sent to: {email}</h1>
                <p style={{ fontSize: '22px' }}>You will be redirected back to your profile in {countdown} seconds.</p>
            </div>
        </div>
    )
}
