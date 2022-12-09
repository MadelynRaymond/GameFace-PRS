import type { LoaderArgs } from '@remix-run/node'
import { json, Response } from '@remix-run/node'
import { NavLink, Outlet, useCatch, useLoaderData, useLocation } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { getAthleteById } from '~/models/athlete.server'
import { requireUserId } from '~/session.server'

export async function loader({ request, params }: LoaderArgs) {
    const userId = await requireUserId(request)
    invariant(params.username, "username not found")
    const athlete = await getAthleteById(userId)

    if (!athlete) {
        throw new Response('Not Found', { status: 404 })
    }

    if(params.username !== athlete.username) {
        throw new Response("Not Authorized", {status: 400})
    }
    return json({
        profile: athlete.profile,
        email: athlete.email,
    })
}
export default function Stats() {
    const { profile, email } = useLoaderData<typeof loader>()
    const location = useLocation()

    return (
        <>
            <div className="stats-menu">
                <div className="stats-menu__items">
                    <NavLink className={location.pathname === `/${email}/stats` ? 'stats-menu__item-selected' : undefined} to={`/${email}/stats`}>
                        Overall
                    </NavLink>
                    {['Speed', 'Shooting', 'Dribbling', 'Passing', 'Strength', 'Jumping'].map((category, i) => (
                        <NavLink className={({ isActive }) => (isActive ? 'stats-menu__item-selected' : undefined)} key={i} to={category}>
                            {category}
                        </NavLink>
                    ))}
                </div>
            </div>
            <Outlet />
        </>
    )
}
