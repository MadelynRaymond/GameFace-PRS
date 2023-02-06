import type { ActionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, Link, useActionData } from '@remix-run/react'
import { createUser, getUserByEmail } from '~/models/user.server'
import { z } from 'zod'

const RegisterSchema = z.object({
    username: z.string().min(5, 'Username must be at least 5 characters').max(15, 'Username must be at most 15 characters'),
    email: z.string().email('Email must be a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters').max(16, 'Password must be less than 16 characters'),
    firstName: z.string().min(2, 'First name must be at least 2 characters').max(25, 'First name must be less than 25 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').max(25, 'Last name must be less than 25 characters'),
    grade: z.enum(['6', '7', '8', '9', '10', '11', '12'], { errorMap: () => ({ message: 'Grade must be between 6 and 12' }) }),
    age: z
        .number()
        .min(10)
        .max(18)
        .transform((val) => val.toString()),
    school: z.string().min(1, 'School is required'),
})
type RegisterFields = z.infer<typeof RegisterSchema>
type RegisterErrors = z.inferFlattenedErrors<typeof RegisterSchema>
type ActionData = {
    errors?: RegisterErrors
    createError?: { message: string }
}

export async function action({ request }: ActionArgs) {
    const formData = await request.formData()
    const entries = Object.fromEntries(formData) as RegisterFields

    try {
        const newStudent = RegisterSchema.parse({ ...entries, age: parseInt(entries.age) })
        const { username, password, email, ...profile } = newStudent

        const existing = await getUserByEmail(email)

        if (existing) {
            return json({ createError: { message: `User with email ${existing.email} already exists` } })
        }

        await createUser({ username, password, email, profile })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return json({ errors: error.flatten() as RegisterErrors })
        }
    }

    return redirect('/login')
}

export default function Register() {
    const actionData = useActionData<ActionData>()
    return (
        <div>
            <div className="registration-form">
                <div className="registration-form-header">
                    <div>
                        <h2 className="registration-header-txt">Student-Athlete Registration</h2>
                        <p>
                            Already have an account?{' '}
                            <Link to="/login">
                                <span>Go to login.</span>
                            </Link>
                        </p>
                    </div>

                    <img
                        src="https://static.wixstatic.com/media/b0e244_4c7a1af456f447cea4b26dade5e2d182~mv2_d_1280_1280_s_2.png/v1/fill/w_564,h_564,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/GameFace413_Logo_FINAL.png"
                        alt=""
                    />
                </div>
                <Form method="post">
                    <div className="registration-form-row">
                        <div>
                            <label>Athlete First Name</label>
                            <input type="text" placeholder="Ex. John" name="firstName"></input>
                            {actionData?.errors?.fieldErrors.firstName && <span className="error-text">{actionData.errors.fieldErrors.firstName[0]}</span>}
                        </div>
                        <div>
                            <label>Athlete Last Name</label>
                            <input type="text" placeholder="Ex. Smith" name="lastName"></input>
                            {actionData?.errors?.fieldErrors.lastName && <span className="error-text">{actionData.errors.fieldErrors.lastName[0]}</span>}
                        </div>
                    </div>
                    <div className="registration-form-row">
                        <div>
                            <label>Username</label>
                            <input type="text" placeholder="Ex. jsmith123" name="username"></input>
                            {actionData?.errors?.fieldErrors.username && <span className="error-text">{actionData.errors.fieldErrors.username[0]}</span>}
                        </div>
                        <div>
                            <label>Password</label>
                            <input type="password" placeholder="Ex. v3rySecu4e!" name="password"></input>
                            {actionData?.errors?.fieldErrors.password && <span className="error-text">{actionData.errors.fieldErrors.password[0]}</span>}
                        </div>
                    </div>
                    <label>Email</label>
                    <input type="text" placeholder="Ex. johnsmith@gmail.com" name="email"></input>
                    {actionData?.errors?.fieldErrors.email && <span className="error-text">{actionData.errors.fieldErrors.email[0]}</span>}

                    <div className="registration-form-row">
                        <div>
                            <label>Age</label>
                            <input type="number" placeholder="14" name="age"></input>
                            {actionData?.errors?.fieldErrors.age && <span className="error-text">{actionData.errors.fieldErrors.age[0]}</span>}
                        </div>
                        <div>
                            <label>Grade</label>
                            <input type="text" placeholder="9th" name="grade"></input>
                            {actionData?.errors?.fieldErrors.grade && <span className="error-text">{actionData.errors.fieldErrors.grade[0]}</span>}
                        </div>
                    </div>
                    <label>School</label>
                    <input type="text" placeholder="First Coast High School" name="school"></input>
                    {actionData?.errors?.fieldErrors.school && <span className="error-text">{actionData.errors.fieldErrors.school[0]}</span>}

                    <div className="register-btn">
                        <button style={{ cursor: 'pointer' }} type="submit" className="register-btn">
                            Register
                        </button>
                    </div>
                    {actionData?.createError?.message && <span className="error-text">{actionData.createError.message}</span>}
                </Form>
            </div>
        </div>
    )
}
