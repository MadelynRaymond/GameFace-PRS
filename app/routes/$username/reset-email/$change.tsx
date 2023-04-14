import type { ActionArgs, LoaderArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { json, Response } from '@remix-run/node'
import { Form, Link, useActionData, useCatch, useLoaderData } from '@remix-run/react'
import jwtDecode from 'jwt-decode'
import jwt from 'jsonwebtoken'
import { changeEmail } from '~/models/user.server'
import { string, z } from 'zod'
import { logout } from '~/session.server'
import { isProbablyEmail } from '~/util'

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

const ChangeEmailSchema = z
    .object({
        newEmail: z.string().email().regex(emailRegex, 'Must be a valid email address'),
        confirmEmail: z.string().email().regex(emailRegex, 'Must be a valid email address'),
    })
    .refine((data) => data.newEmail === data.confirmEmail, { message: 'Emails must match!' })

type ChangeEmailErrors = z.inferFlattenedErrors<typeof ChangeEmailSchema>
type ActionData = {
    errors?: ChangeEmailErrors
    updateErrors?: string
}

type Token = {
    data?: {
        email: string
        userId: number
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

    if (decoded.data && decoded.data.userId === parseInt(userId) && decoded.data.email === email) {
        return { userId: decoded.data.userId, token: decoded }
    }

    throw new Response('Not Authorized', { status: 400 })
    
}

export async function action({ request }: ActionArgs) {
    const formData = await request.formData()
    const userId = formData.get('user-id')
    const newEmail = formData.get('newEmail')
    const confirmEmail = formData.get('confirmEmail')
    const exp = formData.get('token')

    if (typeof newEmail !== 'string' || newEmail.length === 0) {
        return json(
            {
                error: 'Email not provided',
            },
            { status: 400 }
        )
    }
    if (typeof confirmEmail !== 'string' || confirmEmail.length === 0) {
        return json(
            {
                error: 'Email not provided',
            },
            { status: 400 }
        )
    }
    if (!isProbablyEmail(newEmail) || !isProbablyEmail(confirmEmail)) {
        return json(
            {
                error: 'Please enter a valid email',
            },
            { status: 400 }
        )
    }

    if (!userId || !exp) {
        throw new Response('Unexpected Error', { status: 500 })
    }

    if (Date.now() >= parseInt(exp as string) * 1000) {
        throw new Response('Not Authorized', { status: 400 })
    }
    if (newEmail !== confirmEmail) {
        return json({ errors: [{ path: ['confirmEmail'], message: 'Emails must match!' }] })
    }

    try {
        await changeEmail({ userId: parseInt(userId as string), email: newEmail as string })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return json({ errors: error.flatten() as ChangeEmailErrors })
        }
    }

    await changeEmail({ userId: parseInt(userId as string), email: newEmail as string })
    const username = request.url.split('/')[2]
    return redirect(`/${username}/profile`)
    //  return await logout(request) Unsure if we want to logout after successful change or redirect back to profile like changePass
}

export default function () {
    const actionData = useActionData<ActionData>()
    const { userId, token } = useLoaderData<typeof loader>()

    return (
        <div
            style={{
                height: '75vh',
            }}
            className="form-center"
        >
            <Form method="post" style={{ maxWidth: '600px', padding: '1rem' }}>
                <h1>Change Email Address</h1>
                <div>
                    <label htmlFor="newEmail">New Email:</label>
                    <input type="text" name="newEmail" id="newEmail" placeholder="New Email Address" />
                    {actionData?.errors?.fieldErrors.newEmail && <span className="error-text">{actionData.errors.fieldErrors.newEmail[0]}</span>}
                    <label htmlFor="confirmEmail">Confirm Email</label>
                    <input type="text" name="confirmEmail" id="confirmEmail" placeholder="Confirm Email Address" />
                    {actionData?.errors?.fieldErrors.confirmEmail && <span className="error-text">{actionData.errors.fieldErrors.confirmEmail[0]}</span>}
                    <input type="hidden" name="user-id" value={userId} />
                    <input type="hidden" name="token" value={token.exp} />
                </div>
                <div className="flex gap-3">
                    <button className="btn" style={{ display: 'block' }} type="submit">
                        Change Email{' '}
                    </button>
                    <Link style={{ color: 'white' }} className="btn" to={`/`}>
                        Cancel
                    </Link>
                </div>
                <span style={{ display: 'block' }} className="error-text">
                    {/* {actionData?.updateErrors}
                    {actionData?.errors?.formErrors} */}
                </span>
            </Form>
        </div>
    )
}

//The CatchBoundary component only handles errors that are thrown during rendering
export function CatchBoundary() {
    const caught = useCatch()

    if (caught.status === 400) {
        return (
            <div
            style={{
                height: '75vh',
            }}
            className="form-center"
        >
            <Form>
                <h1>Not Authorized: Unique URL Modified</h1>
                <p style={{ fontSize: '22px' }}>Email-Address-Update: Not Authorized</p>
            
            </Form>
            </div>
        )
    }

    throw new Error(`Unexpected caught response with status: ${caught.status}`)
}

