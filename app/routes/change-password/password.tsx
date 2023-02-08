import { ActionArgs, LoaderArgs, json, redirect } from '@remix-run/node'
import { Form, useActionData, useLoaderData, useTransition } from '@remix-run/react'
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

type ChangePasswordErrors = z.inferFlattenedErrors<typeof ChangePasswordSchema>
type ActionData = {
    errors?: ChangePasswordErrors
    createError?: { message: string }
}
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
        if (error instanceof z.ZodError) {
            return json({ errors: error.flatten() as ChangePasswordErrors })
        }
    }
}

export default function () {
    const actionData = useActionData<ActionData>()
    const transition = useTransition()
    const { userId } = useLoaderData<typeof loader>()

    return (
        <div
            style={{
                height: '75vh',
            }}
            className="form-center"
        >
            <Form method="post">
                <h1>Change Password</h1>
                <input type="password" name="password" id="password" placeholder="Current Password" />
                {actionData?.errors?.fieldErrors.currentPassword && <span className="error-text">{actionData.errors.fieldErrors.currentPassword[0]}</span>}
                <input type="password" name="password" id="password" placeholder="New Password" />
                {actionData?.errors?.fieldErrors.newPassword && <span className="error-text">{actionData.errors.fieldErrors.newPassword[0]}</span>}
                <input type="password" name="confirmPassword" id="confirmPassword" placeholder="Confirm Password" />
                {actionData?.errors?.fieldErrors.confirmPassword && <span className="error-text">{actionData.errors.fieldErrors.confirmPassword[0]}</span>}
                <input type="hidden" name="user-id" value={userId} />
                <input className="btn" disabled={transition.state === 'loading'} type="submit" value="Change password" />
                {actionData?.createError?.message && <span className="error-text">{actionData.createError.message}</span>}
            </Form>
        </div>
    )
}
