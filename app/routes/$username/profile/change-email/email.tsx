import type { ActionArgs, LoaderArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Form, Link, useLoaderData, useTransition } from '@remix-run/react'
import { sendEmail } from '~/mailer'
import { createTokenForUser } from '~/models/token.server'
import { getUserByEmail } from '~/models/user.server'
import { requireUser } from '~/session.server'


export async function loader({ request }: LoaderArgs) {
    const user = await requireUser(request)

    if (!user) {
        throw new Response('Not Found', { status: 404 })
    }

    const { id, profile, username, email } = user

    return json({ id, profile, username, email })
}

export async function action({ request }: ActionArgs) {
    const formData = await request.formData()
    const email = formData.get('email')

    if (typeof email !== 'string' || email.length === 0) {
        return json(
            {
                error: 'Email not provided',
            },
            { status: 400 }
        )
    }

    const user = await getUserByEmail(email)

    if (!user) {
        return json(
            {
                error: 'User not found',
            },
            { status: 404 }
        )
    }

    const token = await createTokenForUser(email)
    
    if (!token) {
        throw new Response('Unexpected Error Occured', { status: 500 })
    }


    const resetLink = `http://${process.env.BASE_URL || 'localhost:3000'}/profile/reset-email/change?email=${user.email}&id=${user.id}&token=${token.token}`
    await sendEmail(
        {
            subject: 'Change Email Address',
            reqMsg: 'There was a request to change your Email-Address',
            reqMsg_Body:`If you did initiate this request, please disregard this email and take no further action. However, if you did, please click on the following link to securely change your email`,
            tok_exp_txt:'This request to change your email will expire after 5 mins',
            body: `
                <a  href="${resetLink}" 
                style="background-color:#df7861; border:2px solid black; color:white; padding:1rem 1.5rem; margin:auto; margin-top:6px; display:block; width:183px; font-family:'Montserrat',sans-serif!important; border-radius:12px; text-align:center; text-decoration:none; font-size:1rem;">
                  Confirm Email Address
                </a>`
                ,
                
        },
        email
    )
    const username = request.url.split('/')[3]
    return redirect(`/${username}/profile/change-email/confirm`) 
}



export default function Index() {
    const { username, email } = useLoaderData<typeof loader>()
    const transition = useTransition()

    return (
        <div
            style={{
                height: '75vh',
            }}
            className="form-center"
        >
            <Form method="post">
                <h1>Change Email-Address Request</h1>
                <div>
                    <label htmlFor="email">Current Email: {email} </label>
                    <input type="text" name="email" placeholder="email" defaultValue={email} readOnly />
                </div>
                <div className="flex gap-3">
                    <input className="btn" disabled={transition.state === 'loading'} type="submit" value="Send Confirmation Email" />
                    <Link style={{ color: 'white' }} className="btn" to={`/${username}/profile`}>
                        Cancel
                    </Link>
                </div>
            </Form>
        </div>
    )
}
