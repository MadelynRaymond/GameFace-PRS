import type { ActionArgs, LoaderArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { json, Response } from '@remix-run/node'
import { Form, Link, useActionData, useCatch, useLoaderData, useSubmit } from '@remix-run/react'
import jwtDecode from 'jwt-decode'
import jwt from 'jsonwebtoken'
import { changeEmail } from '~/models/user.server'
import { z } from 'zod'
import { logout } from '~/session.server'
import { sendEmail } from '~/mailer'

//ZOD-ERROR-MSGS: ChangeEmail Form Validation Data
const INVALID_EMAIL_ERROR = 'Must be a valid email address'
const EMAILS_DO_NOT_MATCH_ERROR = 'Emails must match'

const ChangeEmailSchema = z
    .object({
        newEmail: z.string().email(INVALID_EMAIL_ERROR),
        confirmEmail: z.string().email(INVALID_EMAIL_ERROR),
    })
    .refine((data) => data.newEmail === data.confirmEmail, EMAILS_DO_NOT_MATCH_ERROR)

type ChangeEmailErrors = z.inferFlattenedErrors<typeof ChangeEmailSchema>
type ActionData = {
    errors?: ChangeEmailErrors
    updateErrors?: string
}

// JWT: Verifies the Email & UserId from the URL Generated
type Token = {
    data?: {
        email: string
        userId: number
    }
    exp: number
}
export async function loader({ request }: LoaderArgs) {
    //URL contains these three query parameters, to ensure that they are present in the URL.
    const url = new URL(request.url)
    const token = url.searchParams.get('token')
    const userId = url.searchParams.get('id')
    const email = url.searchParams.get('email')

    if (!userId || !token || !email) {
        throw new Response('Not Found', { status: 404 })
    }

    // Checks whether the (JWT) is valid or not
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
    const data = await Object.fromEntries(formData)
    const userId = formData.get('user-id')
    const exp = formData.get('token')

    if (!userId || !exp) {
        throw new Response('Unexpected Error', { status: 500 })
    }

    if (Date.now() >= parseInt(exp as string) * 1000) {
        throw new Response('Not Authorized', { status: 400 })
    }
    
    try {
        const validatedEmailData = await ChangeEmailSchema.parseAsync(data)
        await changeEmail({ userId: parseInt(userId as string), email: validatedEmailData.newEmail })
        await sendEmail(
            {
                subject: 'Email Successfully Updated',
                reqMsg: 'Your email has been successfully updated',
                reqMsg_Body: `If you did initiate this request, please disregard this email and take no further action. However, if you didn't please contact support`,
                body: ``,
                tok_exp_txt: 'This request to change your email was verified !',
            },
            validatedEmailData.newEmail
        )
    } catch (error) {
        if (error instanceof z.ZodError) {
            return json({ errors: error.flatten() as ChangeEmailErrors })
        }
    }
    return await logout(request)
}

export default function ChangeEmail() {
    const actionData = useActionData<ActionData>()
    const { userId, token } = useLoaderData<typeof loader>()

    return (
        <div style={{height: '75vh', }} className="form-center">
            <Form method="post" style={{ maxWidth: '600px', padding: '1rem' }}>
                <h1>Change Email Address</h1>
                <br></br>
                <div>
                    <label htmlFor="newEmail">New Email:</label>
                    <input type="text" name="newEmail" id="newEmail" placeholder="New Email Address" />
                    {actionData?.errors?.fieldErrors.newEmail && <span className="error-text">{actionData.errors.fieldErrors.newEmail[0]}</span>}
                    <br></br>
                    <label htmlFor="confirmEmail">Confirm Email:</label>
                    <input type="text" name="confirmEmail" id="confirmEmail" placeholder="Confirm Email Address" />
                    {actionData?.errors?.fieldErrors.confirmEmail && <span className="error-text">{actionData.errors.fieldErrors.confirmEmail[0]}</span>}
                    <br></br>
                    <input type="hidden" name="user-id" value={userId} />
                    <input type="hidden" name="token" value={token.exp} />
                </div>
                <div className="login-btn-group">
                    <button className="btn login-btn" type="submit">
                        Change Email
                    </button>
                </div>
                {actionData?.errors?.formErrors && <span className="error-text">{actionData.errors.formErrors[0]}</span>}
            </Form>
        </div>
    )
}

//The CatchBoundary component only handles errors that are thrown during rendering
export function CatchBoundary() {
    const caught = useCatch()

    if (caught.status === 400) {
        return (
            <div style={{ height: '75vh' }} className="form-center">
                <div>
                    <h1>Request Not Authorized: Unique URL Modified</h1>
                    <h2 style={{ fontSize: '28px', color: 'red' }}>Status Code: 400</h2>
                </div>
            </div>
        )
    }

    throw new Error(`Unexpected caught response with status: ${caught.status}`)
}
