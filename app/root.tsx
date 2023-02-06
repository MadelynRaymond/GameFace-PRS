import globals from '~/styles/index.css'
import appStyles from '~/styles/app.css'
// styles is now something like /build/global-AE33KB2.css
import type { LoaderArgs, MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, Link, Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from '@remix-run/react'
import { getUser } from './session.server'
import Basketball from '~/assets/basketballprofilepic.png'

export const meta: MetaFunction = () => ({
    charset: 'utf-8',
    title: 'GameFace PRS',
    viewport: 'width=device-width,initial-scale=1',
})

export function links() {
    return [
        {
            rel: 'stylesheet',
            href: globals,
        },
        {
            rel: 'stylesheet',
            href: appStyles,
        },
        {
            rel: 'stylesheet preload prefetch',
            href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap',
            as: 'style',
        },
        {   rel: 'stylesheet preload prefetch',
            href: 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap',
            as: 'style'


        }
        
    ]
}

export async function loader({ request }: LoaderArgs) {
    return json({
        user: await getUser(request),
    })
}

function Navbar() {
    const { user } = useLoaderData<typeof loader>()

    return (
        <nav className="navbar no-print">
            <div>
                <div>
                    <ul>
                        <li>
                            <p className="nav-logo">Game Face PRS</p>
                        </li>
                    </ul>
                </div>
            </div>

            <div>
                {user ? (
                    <ul className="left-nav-container">

                        <li className="left-nav-btn">
                            <a href="https://www.gameface413.org/">Main Site</a>
                        </li>
                        <li className="left-nav-btn">
                            <Link to={`${user?.username}/stats`}>My Stats</Link>
                        </li>
                        <li className="left-nav-btn">
                            <Form method="post" action="/logout">
                                <input
                                    type="submit"
                                    className="logout-btn"
                                    value="Logout"
                                />
                            </Form>
                        </li >

                        <li className="left-nav-btn">
                            <Link to={`${user?.username}/profile`}>
                                Profile
                            </Link>
                        </li>
                    </ul>
                ) : (
                    <ul>
                        <li>
                            <Link
                                style={{
                                    display: 'block',
                                }}
                                className="nav-btn"
                                to="/login"
                            >
                                Login
                            </Link>
                        </li>
                        <li>
                            <Link
                                style={{
                                    display: 'block',
                                }}
                                className="nav-btn"
                                id="register"
                                to="/register"
                            >
                                Register
                            </Link>
                        </li>
                    </ul>
                )}
            </div>
        </nav>
    )
}

export default function App() {
    return (
        <html lang="en">
            <head>
                <Meta />
                <Links />
            </head>
            <body>
                <Navbar />
                <Outlet />
                <ScrollRestoration />
                <Scripts />
                <LiveReload />
            </body>
        </html>
    )
}
