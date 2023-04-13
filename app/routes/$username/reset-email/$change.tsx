import type { ActionArgs, LoaderArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { json, Response } from '@remix-run/node'
import { Form, Link, useActionData, useCatch, useLoaderData } from '@remix-run/react'
import jwtDecode from 'jwt-decode'
import jwt from 'jsonwebtoken'
import { changeEmail } from '~/models/user.server'
import { string } from 'zod'
import { logout } from '~/session.server'


type Token = {
    data?: {
        userId: number
        email: string
    }
    exp: number
}

export async function loader({ request }: LoaderArgs) {
    const url = new URL(request.url)
    const token = url.searchParams.get('token')
    const userId = url.searchParams.get('id')
    const email = url.searchParams.get('email')

    if (!userId || !token || !email) {
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

    if (!userId || !exp || !email) {
        throw new Response('Unexpected Error', { status: 500 })
    }

    if (Date.now() >= parseInt(exp as string) * 1000) {
        throw new Response('Not Authorized', { status: 400 })
    }

    // await changePassword({ userId: parseInt(userId as string), password })
    // const emailValue = email as string | null
    // if (!emailValue) {
    //     throw new Response('Invalid email', { status: 400 })
    // }
    await changeEmail({ userId: parseInt(userId as string), email:(email as string) })

     return await logout(request)
    // return redirect(`/${username}/profile`)
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


                <h1>Change Email Address</h1>
                <br></br>
                <div>
                    <label htmlFor="email">New Email:</label>
                    <input type="text" name="email" id="email" placeholder="New Email Address" />
                </div>
                {/* <div>
                    <label htmlFor="email">Confirm Email</label>
                    <input type="text" name="email" id="email" placeholder="Confirm Email Address" />
                </div> */}
                <div className='flex gap-3'>
                    
                    <input type="hidden" name="user-id" value={userId} />
                    <input type="hidden" name="token" value={token.exp} />
                    <button className="btn" style={{ display: 'block' }} type="submit">
                        Change Email
                    </button>
                    <Link style={{ color: 'white' }} className="btn" to={`/profile`}>
                        Cancel
                    </Link>
                    </div>
            </Form>
        </div>
    )
}
