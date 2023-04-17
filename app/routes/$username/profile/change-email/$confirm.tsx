import { LoaderArgs, json } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
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
    const { email } = useLoaderData<typeof loader>()

    const [countdown, setCountdown] = useState(5)

    useEffect(() => {
        const countdownTimer = setTimeout(() => {
            setCountdown((countdown) => countdown - 1)
        }, 1000)

        return () => clearTimeout(countdownTimer)
    }, [countdown])

    useEffect(() => {
        const redirectTimer = setTimeout(() => {
            const form = document.createElement('form')
            form.method = 'post'
            form.action = '/logout'
            document.body.appendChild(form)
            form.submit()
        }, 15000)

        return () => clearTimeout(redirectTimer)
    }, [])

    if (countdown > 0) {
        return (
            <div style={{ height: '75vh' }} className="form-center">
                <Form method="post">
                    <h1>A link to change your account email has been sent to: {email}</h1>
                    <p style={{ fontSize: '22px' }}>You will be redirected back to your profile in {countdown} seconds.</p>
                </Form>
            </div>
        )
    } else {
        const form = document.createElement('form')
        form.method = 'post'
        form.action = '/logout'
        document.body.appendChild(form)
        form.submit()
        return null
    }
}
