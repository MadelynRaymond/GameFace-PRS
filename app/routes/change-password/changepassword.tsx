import { ActionArgs, LoaderArgs, json, redirect } from '@remix-run/node'
import { Form, useActionData, useTransition } from '@remix-run/react'
import { ZodError, z } from 'zod'
import { changePassword } from '~/models/user.server'
import { requireUser, requireUserId } from '~/session.server'
import { action } from '../staff/athletes/$athleteId/fetch'


export const ChangePasswordSchema = z
    .object({
        currentPassword: z.string().min(4),
        newPassword: z.string().min(4),
        confirmPassword: z.string().min(4),
    })
    .refine((data) => data.newPassword === data.confirmPassword, 'Passwords must match')

// Loader will get called when the page loads
export async function loader({ request }: LoaderArgs) {
    const userId = await requireUserId(request)
    return json({ userId })
}
// Action will get called when you submit the form
export async function ChangePassword({ request }: ActionArgs) {
    const { username, id } = await requireUser(request)
    try {
        const formData = await request.formData()
        const data = await Object.fromEntries(formData)
        const validatedData = await ChangePasswordSchema.parseAsync(data)
        
        await changePassword({ userId: id, password: validatedData.newPassword })
    } catch (error) {
        if (error instanceof ZodError) {
            return json({ errors: error.flatten() })
        }
    }
}

export default function () {
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
