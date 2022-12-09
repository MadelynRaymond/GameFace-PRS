import type { ActionArgs} from '@remix-run/node';
import { redirect } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, Link, useActionData } from '@remix-run/react'
import { createUser, getUserByEmail } from '~/models/user.server'
import { isProbablyEmail, validateAge, validateGrade, validateName, validatePassword, validateRequired } from '~/util'

interface RegistrationFormData {
    username: string
    email: string
    password: string
    firstName: string
    lastName: string
    grade: string
    age: string
    school: string
}

export async function action({ request }: ActionArgs) {
    const formData = await request.formData()
    const entries = Object.fromEntries(formData)

    const errors = {
        firstName: !validateName(entries.firstName) ? 'First name must be at least 3 characters' : null,
        lastName: !validateName(entries.lastName) ? 'Last name must be at least 3 characters' : null,
        email: !isProbablyEmail(entries.email) ? 'Email must be a valid email' : null,
        password: !validatePassword(entries.password, 8) ? 'Password must be at least 8 characters' : null,
        age: !validateAge(parseInt(entries.age as string)) ? 'You must be at least 10 to make an account' : null,
        username: !validateRequired(entries.username) ? 'Username is required' : null,
        school: !validateRequired(entries.school) ? 'School is required' : null,
        grade: !validateGrade(parseInt(entries.grade as string)) ? 'Grade must be 6th or higher' : null,
    }

    if (Object.values(errors).some(Boolean)) {
        return json({ errors })
    }

    const existing = await getUserByEmail(entries.email as string)

    if (existing) {
        return json({ errors: { create: 'A user with this email already exists' } })
    }

    const { username, password, email, ...profile } = entries as unknown as RegistrationFormData
    await createUser({ username, email, password, profile })

    return redirect('/login')
}

export default function Register() {
    const actionData = useActionData()
    return (
        <div>
            <div className="registration-form">
                <div className="registration-form-header">
                    <div>
                        <h2>Student-Athlete Registration</h2>
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
                            {actionData?.errors.firstName && <span className="error-text">{actionData.errors.firstName}</span>}
                        </div>
                        <div>
                            <label>Athlete Last Name</label>
                            <input type="text" placeholder="Ex. Smith" name="lastName"></input>
                            {actionData?.errors.lastName && <span className="error-text">{actionData.errors.lastName}</span>}
                        </div>
                    </div>
                    <div className="registration-form-row">
                        <div>
                            <label>Username</label>
                            <input type="text" placeholder="Ex. jsmith123" name="username"></input>
                            {actionData?.errors.username && <span className="error-text">{actionData.errors.username}</span>}
                        </div>
                        <div>
                            <label>Password</label>
                            <input type="password" name="password"></input>
                            {actionData?.errors.password && <span className="error-text">{actionData.errors.password}</span>}
                        </div>
                    </div>
                    <label>Email</label>
                    <input type="text" placeholder="Ex. johnsmith@gmail.com" name="email"></input>
                    {actionData?.errors.email && <span className="error-text">{actionData.errors.email}</span>}

                    <div className="registration-form-row">
                        <div>
                            <label>Age</label>
                            <input type="number" placeholder="14" name="age"></input>
                            {actionData?.errors.age && <span className="error-text">{actionData.errors.age}</span>}
                        </div>
                        <div>
                            <label>Grade</label>
                            <input type="number" placeholder="9th" name="grade"></input>
                            {actionData?.errors.grade && <span className="error-text">{actionData.errors.grade}</span>}
                        </div>
                    </div>
                    <label>School</label>
                    <input type="text" placeholder="First Coast High School" name="school"></input>
                    {actionData?.errors.school && <span className="error-text">{actionData.errors.school}</span>}
                    <div className="register-btn">
                        <button style={{ cursor: 'pointer' }} type="submit" className="register-btn">
                            Register
                        </button>
                    </div>
                </Form>
            </div>
        </div>
    )
}
