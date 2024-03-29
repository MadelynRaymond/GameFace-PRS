import type { ActionArgs, LoaderArgs} from '@remix-run/node';
import { json, redirect } from '@remix-run/node'
import { Form, Link, useActionData, useLoaderData } from '@remix-run/react'
import { requireUser } from '~/session.server'
import { z } from 'zod'
import invariant from 'tiny-invariant'
import { updateAthleteProfile } from '~/models/athlete.server'

const phoneRegex = /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/
const EditSchema = z.object({
    id: z.coerce.number(),
    age: z
        .optional(z.coerce.number().min(8, 'Age must be at least 8'))
        .or(z.literal(''))
        .transform((d) => (d === '' ? undefined : d)),
    grade: z
        .optional(z.coerce.number().min(6, 'Grade must be at least 6th').max(12, 'Grade must be at most 12th'))
        .or(z.literal(''))
        .transform((d) => (d === '' ? undefined : d)),
    school: z.optional(
        z
            .string()
            .min(3, 'School must have more than 3 characters')
            .or(z.literal(''))
            .transform((d) => (d === '' ? undefined : d))
    ),
    guardianName: z.optional(
        z
            .string()
            .min(3, "Guardian name must be at least 5 characters")
            .max(30, "Guardian name must be at most 30 characters")
            .or(z.literal(''))
            .transform((d) => (d === '' ? undefined : d))
    ),
    guardianPhone: z.optional(
        z
            .string()
            .regex(new RegExp(phoneRegex), "Must be a valid phone number")
            .or(z.literal(''))
            .transform((d) => (d === '' ? undefined : d))
    )
}).refine(data => {
    const {id, ...partial} = data
    return Object.values(partial).some(val => val !== undefined)
}, {message: "At least one field must be filled"})

type EditErrors = z.inferFlattenedErrors<typeof EditSchema>

type ActionData = {
    errors?: EditErrors
    updateError?: string
}

export async function loader({ request }: LoaderArgs) {
    const user = await requireUser(request)

    if (!user) {
        throw new Response('Not Found', { status: 404 })
    }

    const { id, profile, username, email } = user

    return json({ id, profile ,username, email})
}

export async function action({ request }: ActionArgs) {
    const formData = await request.formData()

    const entries = Object.fromEntries(formData)

    const result = await EditSchema.safeParseAsync(entries)
    
    if (!result.success) {
        return json({ errors: result.error.flatten() })
    }


    invariant(result.success, 'This should not happen')
    const { id, ...update } = result.data
    console.log(result.data)


    try {
        await updateAthleteProfile(id, update)
    } catch (error) {
        if (error instanceof Error) {
            return json({ updateError: error.message })
        }
    }

    const username = request.url.split('/')[2]

    return redirect(`/${username}/profile`)
}

export default function EditProfile() {
    const { id, username, profile, email } = useLoaderData<typeof loader>()

    const actionData = useActionData<ActionData>()

    return (
        <div className="edit-profile-container">
            <h1>Edit Profile</h1>
            <Form method="post">
                <div className="">
                    <div className="edit-group">
                        <label htmlFor="age">Age</label>
                        <input type="text" name="age" placeholder="age" defaultValue={profile?.age} />
                        <span className="error-text">{actionData?.errors?.fieldErrors.age && actionData.errors.fieldErrors.age[0]}</span>
                    </div>
                    <div className="edit-group">
                        <div>
                            <label htmlFor="grade">Grade</label>
                            <input type="number" name="grade" placeholder="grade" defaultValue={profile?.grade} />
                            <span className="error-text">{actionData?.errors?.fieldErrors.grade && actionData.errors.fieldErrors.grade[0]}</span>
                        </div>
                        <div>
                            <label htmlFor="school">School</label>
                            <input type="text" name="school" placeholder="school" defaultValue={profile?.school} />
                            <span className="error-text">{actionData?.errors?.fieldErrors.school && actionData.errors.fieldErrors.school[0]}</span>
                        </div>
                    </div>
                    <div className="edit-group">
                        <div>
                            <label htmlFor="guardianName">Guardian Name</label>
                            <input type="text" name="guardianName" id="guardian-name" placeholder='guardian name' defaultValue={profile?.guardianName ?? undefined}/>
                            <span className="error-text">{actionData?.errors?.fieldErrors.guardianName && actionData.errors.fieldErrors.guardianName[0]}</span>
                        </div>
                        <div>
                            <label htmlFor="guardianPhone">Guardian Phone</label>
                            <input type="text" name="guardianPhone" id="guardian-phone" placeholder='guardian phone' defaultValue={profile?.guardianPhone ?? undefined}/>
                            <span className="error-text">{actionData?.errors?.fieldErrors.guardianPhone && actionData.errors.fieldErrors.guardianPhone[0]}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <input type="hidden" name="id" value={id} />
                    <input type="submit" className="btn" value="Save" />
                    <Link className="btn" to={`/${username}/profile`}>
                        Cancel
                    </Link>
                </div>
                <span style={{ display: 'block' }} className="error-text">
                    {actionData?.updateError}
                    {actionData?.errors?.formErrors}
                </span>
            </Form>
        </div>
    )
}
