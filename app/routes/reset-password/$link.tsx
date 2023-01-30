import type { ActionArgs, LoaderArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { json, Response } from '@remix-run/node'
import { Form, useActionData, useLoaderData } from '@remix-run/react'
import jwtDecode from 'jwt-decode'
import jwt from 'jsonwebtoken'
import { changePassword } from '~/models/user.server'
import { validatePassword } from '~/util'

type Token = {
    data?: {
        userId: number
    }
    exp: number
}

export async function loader({ request }: LoaderArgs) {
    const url = new URL(request.url)
    const token = url.searchParams.get('token')
    const userId = url.searchParams.get('id')

    if (!userId || !token) {
        throw new Response('Not Found', { status: 404 })
    }

    if (!jwt.verify(token, 'SECRET')) {
        throw new Response('Not Authorized', { status: 400 })
    }

    const decoded: Token = jwtDecode(token)

    if (decoded.data && decoded.data.userId === parseInt(userId)) {
        return { userId: decoded.data.userId, token: decoded }
    }

    throw new Response('Not Authorized', { status: 400 })
}

export async function action({ request }: ActionArgs) {
    const formData = await request.formData()
    const password = formData.get('password')
    const confirmPassword = formData.get('confirm-password')
    const userId = formData.get('user-id')
    const exp = formData.get('token')

    if (!userId || !exp) {
        throw new Response('Unexpected Error', { status: 500 })
    }

    if (!validatePassword(password, 8)) {
        return json({ errors: { password: 'Password must be at least 8 characters', confirmPassword: null } })
    }

    if (password !== confirmPassword) {
        return json({ errors: { password: null, confirmPassword: 'Passwords must match' } })
    }

    if (Date.now() >= parseInt(exp as string) * 1000) {
        throw new Response('Not Authorized', { status: 400 })
    }

    await changePassword({ userId: parseInt(userId as string), password })
    return redirect('/login')
}

export default function () {
    const { userId, token } = useLoaderData<typeof loader>()
    const actionData = useActionData<typeof action>()

    return (
        <div
            style={{
                height: '75vh',
            }}
            className="form-center"
        >
            <Form method="post">
                <h1>Reset Password</h1>
                <input type="text" name="password" id="password" placeholder="Password" />
                <span className="error-text">{actionData?.errors?.password}</span>
                <input type="text" name="confirm-password" id="confirm-password" placeholder="Confirm Password" />
                <input type="hidden" name="user-id" value={userId} />
                <input type="hidden" name="token" value={token.exp} />
                <span className="error-text">{actionData?.errors?.confirmPassword}</span>
                <button style={{ display: 'block' }} type="submit">
                    Change Password
                </button>
            </Form>
        </div>
    )
}
