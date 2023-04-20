import { LoaderArgs, redirect } from '@remix-run/node'
import { json, Response } from '@remix-run/node'
import { Link, useLoaderData, useLocation } from '@remix-run/react'
import { requireUser } from '~/session.server'

export async function loader({ request }: LoaderArgs) {
    const user = await requireUser(request)

    if (!user) {
        throw new Response('Not Found', { status: 404 })
    }

    if (user.role === 'STAFF') return redirect('/staff/athletes')

    const { profile, email, username } = user

    return json({ profile, email, username })
}
export default function Profile() {
    const { profile, email, username } = useLoaderData<typeof loader>()
    return (
            <div className='profile'>
                <div className="profile-banner">
                    <div className="">  
                        <h2>Welcome back, {profile?.firstName}!</h2>
                        <div className="profile-btn-group">
                            <Link to="edit" className='btn edit-profile-btn'>Edit Profile</Link>
                            <Link to={`/${username}/change-password`} className="btn edit-profile-btn">Change Password</Link>
                            <Link to={`/${username}/profile/change-email/email`} className="btn edit-profile-btn">Change Email</Link>
                        </div>
                    </div>
                </div>
                <div className="profile-container">
                    <div>
                        <h3>First Name:</h3>
                        <p>{profile?.firstName}</p>
                    </div>
                    <div>
                        <h3>Last Name:</h3>
                        <p>{profile?.lastName}</p>
                    </div>
                    <div>
                        <h3>Email:</h3>
                        <p>{email}</p>
                    </div>
                    <div>
                        <h3>Age:</h3>
                        <p>{profile?.age}</p>
                    </div>
                    <div>
                        <h3>Grade:</h3>
                        <p>{profile?.grade}</p>
                    </div>
                    <div>
                        <h3>School:</h3>
                        <p>{profile?.school}</p>
                    </div>
                    <div>
                        <h3>Guardian Name:</h3>
                        <p>{profile?.guardianName}</p>
                    </div>
                    <div>
                        <h3>Guardian Phone:</h3>
                        <p>{profile?.guardianPhone}</p>
                    </div>
                </div>
            </div>
    )
}
