import type { LoaderArgs} from "@remix-run/node";
import { json, Response } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUser } from "~/session.server";

export async function loader({request}: LoaderArgs) {
    const user = await requireUser(request)

    if(!user) {
        throw new Response("Not Found", {status: 404})
    }

    const {profile, email} = user

    return json({profile, email})
}
export default function Profile() {
    const {profile, email} = useLoaderData<typeof loader>()
    return (
        <div>
            <div className="profile-banner">
                <h2>Welcome back, {profile?.firstName}!</h2>
                <div className="profile-btn-group">
                    <button className="btn">Edit Profile</button>
                    <button className="btn">Reset Password</button>
                </div>
            </div>
            <div className="profile-container">
                <div>
                    <h3>Email</h3>
                    <p>{email}</p>
                </div>
                <div>
                    <h3>Age</h3>
                    <p>{profile?.age}</p>
                </div>
                <div>
                    <h3>Grade</h3>
                    <p>{profile?.grade}</p>
                </div>
                <div>
                    <h3>School:</h3>
                    <p>{profile?.school}</p>
                </div>
            </div>
        </div>
    )
}
