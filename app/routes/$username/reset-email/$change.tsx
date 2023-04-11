import type { ActionArgs, LoaderArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { json, Response } from '@remix-run/node'
import { Form, useActionData, useCatch, useLoaderData } from '@remix-run/react'
import jwtDecode from 'jwt-decode'
import jwt from 'jsonwebtoken'
import { changeEmail } from '~/models/user.server'
import { string } from 'zod'
import { logout } from '~/session.server'

type Token = {
    data?: {
        userId: number,
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

    //Checks if the token is expired
    if (!jwt.verify(token, 'SECRET')) {
        throw new Response('Not Authorized', { status: 400 })
    }

    //Verify a token symmetric - synchronous
    const decoded: Token = jwtDecode(token)

    if (decoded.data && decoded.data.userId === parseInt(userId)) {
        return { userId: decoded.data.userId, token: decoded }
    }

    throw new Response('Not Authorized', { status: 400 })
}

export async function action({ request }: ActionArgs) {
    const formData = await request.formData()
    const userId = formData.get('user-id')
    const email = formData.get('email')
    const exp = formData.get('token')

    if (!userId || !exp) {
        throw new Response('Unexpected Error', { status: 500 })
    }

    if (Date.now() >= parseInt(exp as string) * 1000) {
        throw new Response('Not Authorized', { status: 400 })
    }

    // await changePassword({ userId: parseInt(userId as string), password })
    const emailValue = email as string | null
    if (!emailValue) {
        throw new Response('Invalid email', { status: 400 })
    }
    await changeEmail({ userId: parseInt(userId as string), email: emailValue })

    return await logout(request)
}

export default function () {
    const { userId, token } = useLoaderData<typeof loader>()


    return (
        <div
            style={{
                height: '75vh',
            }}
            className="form-center"
        >
            <Form method="post">
                <h1>Change Email</h1>
                <div className="flex gap-3">

                <input type="email" name="email" id="email" placeholder="Email" />
                {/* <span className="error-text">{actionData?.errors?.password}</span> */}
                <input type="email" name="confirm-email" id="confirm-email" placeholder="Confirm Email" />
                <input type="hidden" name="user-id" value={userId} />
                <input type="hidden" name="token" value={token.exp} />
                {/* <span className="error-text">{actionData?.errors?.confirmPassword}</span> */}
                <button className="btn" style={{ display: 'block' }} type="submit">
                    Change Email
                </button>
                </div>
            </Form>
        </div>
    )
}
