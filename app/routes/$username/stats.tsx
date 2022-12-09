import type { LoaderArgs } from '@remix-run/node'
import { json, Response } from '@remix-run/node'
import { NavLink, Outlet, useCatch, useLoaderData, useLocation } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { getAthleteById } from '~/models/athlete.server'
import { requireUser, requireUserId } from '~/session.server'

export async function loader({ request, params }: LoaderArgs) {
    const athlete = await requireUser(request)
    invariant(params.username, "username not found")

    if (!athlete) {
        throw new Response('Not Found', { status: 404 })
    }

    return json({
        profile: athlete.profile,
        email: athlete.email,
    })
}
export default function Stats() {
    const { email } = useLoaderData<typeof loader>()
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
