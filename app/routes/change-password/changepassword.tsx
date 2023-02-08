import { LoaderArgs, json, redirect } from '@remix-run/node'
import { Form, useActionData, useTransition } from '@remix-run/react'
import { z } from 'zod'
import { changePassword, getUserByEmail, getUserById, verifyLogin } from '~/models/user.server'
import { requireUser } from '~/session.server'
import { action } from '../staff/athletes/$athleteId/fetch'
export const ChangePasswordSchema = z
    .object({
        currentPassword: z.string().min(4),
        newPassword: z.string().min(4),
        confirmPassword: z.string().min(4),
    })
    .refine((data) => data.newPassword === data.confirmPassword, 'Passwords must match')

export async function loader({ request }: LoaderArgs) {
    const { username, id } = await requireUser(request)
    try {
        const formData = await request.formData()
        const data = await Object.fromEntries(formData)
        const validatedData = await ChangePasswordSchema.parseAsync(data)

        await changePassword({ userId: id, password: validatedData.newPassword })
    } catch (error) {
        console.error(error)
    }
}

export default function ChangePassword() {
    const actionData = useActionData<typeof action>()
    const transition = useTransition()
    return (
        <div
            style={{
                height: '75vh',
            }}
            className="form-center"
        >
            <Form method="post">
                <h1>Change Password</h1>
                <input type="password" name="password" id="password" placeholder="New Password" />
                <input type="password" name="confirmPassword" id="confirmPassword" placeholder="Confirm Password" />
                <input className="btn" disabled={transition.state === 'loading'} type="submit" value="Change password" />
            </Form>
        </div>
    )
}
