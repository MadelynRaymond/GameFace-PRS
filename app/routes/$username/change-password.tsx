import { ActionArgs, LoaderArgs, json, redirect } from '@remix-run/node'
import { Form, useActionData, useLoaderData, useTransition } from '@remix-run/react'
import { ZodError, z } from 'zod'
import { changePassword } from '~/models/user.server'
import { logout, requireUser, requireUserId } from '~/session.server'

export const ChangePasswordSchema = z
    .object({
        newPassword: z.string().min(4),
        confirmPassword: z.string().min(4),
    })
    .refine((data) => data.newPassword === data.confirmPassword, 'Passwords must match')

type ChangePasswordErrors = z.inferFlattenedErrors<typeof ChangePasswordSchema>
type ActionData = {
    errors?: ChangePasswordErrors
    updateError?: { message: string }
}
// Loader will get called when the page loads
export async function loader({ request }: LoaderArgs) {
    const userId = await requireUserId(request)
    return json({ userId })
}
// Action will get called when you submit the form
export async function action({ request }: ActionArgs) {
    const { id } = await requireUser(request)
    const formData = await request.formData()
    const data = await Object.fromEntries(formData)
    try {
        const validatedData = await ChangePasswordSchema.parseAsync(data)
        await changePassword({ userId: id, password: validatedData.newPassword })
        
    } catch (error) {
        if (error instanceof z.ZodError) {
            return json({ errors: error.flatten() as ChangePasswordErrors })
        }
    }
    return await logout(request)
}

export default function ChangePassword() {
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
            <Form method="post" style={{ maxWidth: '600px', padding: '1rem' }}>
                <h1>Change Password</h1>
                <input type="password" name="newPassword" id="newPassword" placeholder="New Password" />
                {actionData?.errors?.fieldErrors.newPassword && <span className="error-text">{actionData.errors.fieldErrors.newPassword[0]}</span>}
                <input type="password" name="confirmPassword" id="confirmPassword" placeholder="Confirm Password" />
                {actionData?.errors?.fieldErrors.confirmPassword && <span className="error-text">{actionData.errors.fieldErrors.confirmPassword[0]}</span>}
                <input type="hidden" name="user-id" value={userId} />
                <div>
                    <input className="btn" disabled={transition.state === 'loading'} type="submit" value="Change password" />
                    {actionData?.errors?.formErrors && <span className="error-text">{actionData.errors.formErrors[0]}</span>}
                </div>
            </Form>
        </div>
    )
}
