import type { ActionArgs, LoaderArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, Link, useActionData } from '@remix-run/react'
import React from 'react'
import { verifyLogin } from '~/models/user.server'
import { createUserSession, getUserId } from '~/session.server'

export async function loader({ request }: LoaderArgs) {
    const userId = await getUserId(request)
    if (userId) return redirect('/')
    return json({})
}

export async function action({ request }: ActionArgs) {
    const formData = await request.formData()
    const email = formData.get('email')
    const password = formData.get('password')

    if (typeof email !== 'string' || email.length === 0) {
        return json(
            {
                errors: {
                    email: 'Email is required',
                    password: null,
                },
            },
            { status: 400 }
        )
    }

    if (typeof password !== 'string' || password.length === 0) {
        return json(
            {
                errors: {
                    email: null,
                    password: 'Password is required',
                },
            },
            { status: 400 }
        )
    }

    const user = await verifyLogin(email, password)

    if (!user) {
        return json(
            {
                errors: {
                    email: null,
                    password: 'Invalid username or password',
                },
            },
            { status: 400 }
        )
    }

    const redirectTo = user.role === 'STAFF' ? '/staff/athletes' : `/${user.username}/stats`

    return createUserSession({
        request,
        userId: user.id,
        remember: true,
        redirectTo,
    })
}

export default function Login() {
    const actionData = useActionData<typeof action>()
    const email = React.useRef<HTMLInputElement>(null)
    const password = React.useRef<HTMLInputElement>(null)

    return (
        <div
            style={{
                height: '75vh',
            }}
            className="form-center"
        >
            <Form method="post" id="login">
                <h1 className="welcome-back-txt">Welcome Back!</h1>
                <div className="register-link">
                    <Link to="/register">New here? Create an account!</Link>
                </div>
                <div>
                    <input ref={email} type="text" name="email" id="email" placeholder="Email" />
                    <span className="error-text">{actionData?.errors?.email}</span>
                </div>
                <div>
                    <input ref={password} type="Password" name="password" id="password" placeholder="Password" />
                    <span className="error-text">{actionData?.errors?.password}</span>
                </div>
                <div className="login-btn-group">
                    <input className="btn login-btn" type="submit" name="login" value="Login" />
                    <Link className="forgot-password-link" to="/forgot-password">
                        Forgot password?
                    </Link>
                </div>
            </Form>
        </div>
    )
}
