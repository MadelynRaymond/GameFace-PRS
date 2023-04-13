import {json } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { requireUser } from "~/session.server";

export async function loader({request}: LoaderArgs) {
    const user = await requireUser(request)
    const {email,username} = user
    return json({
        email,username
    })

}

export default function ChangeEmail() {
    const {username,email} = useLoaderData<typeof loader>()
    
    return(
        <><div>
            <h1>
                A Change Email Link has been sent to: {email}</h1>
        </div>
        <div className="flex gap-3">
        <Link className="btn" to={`/${username}/profile`}>
                Cancel
            </Link>
        
        </div>
        </>
    )

}