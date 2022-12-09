import type { LoaderArgs } from '@remix-run/node'
import { json, Response } from '@remix-run/node'
import { NavLink, Outlet, useLoaderData, useLocation } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { requireUser } from '~/session.server'

export async function loader({ request, params }: LoaderArgs) {
    const athlete = await requireUser(request)
    invariant(params.username, "username not found")

    if (!athlete) {
        throw new Response('Not Found', { status: 404 })
    }

    return json({
        username: athlete.username
    })
}
export default function Stats() {
    const { username } = useLoaderData<typeof loader>()
    const location = useLocation()

    return (
        <>
            <div className="stats-menu no-print">
                <div className="stats-menu__items">
                    <NavLink className={location.pathname === `/${username}/stats` ? 'stats-menu__item-selected' : undefined} to={`/${username}/stats`}>
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
