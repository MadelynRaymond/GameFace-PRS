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
                        <a href="https://www.gameface413.org/" className="orange-background">
                            <li className="left-nav-btn">
                            <p className="menu-text">Main Site</p>
                            </li>
                        </a>
                        <Link to={`${user?.username}/stats`} className="purple-background">
                            <li className="left-nav-btn"><p className="menu-text">My Stats</p></li>
                        </Link>
                        <Form className='logout-btn orange-background' method="post" action="/logout "> 
                            <button type='submit'><p className="menu-text">Logout</p></button>
                        </Form>
                        <Link to={`${user?.username}/profile`} className="red-background">
                            <li className="left-nav-btn">
                                <p className="menu-text">Profile</p>
                            </li>
                        </Link>
                       
                    </ul>
                ) : (
                    <ul className="left-nav-container">
                            <Link
                                style={{
                                    display: 'block',
                                }}
                                className="nav-btn orange-background"
                                to="/login"
                            ><li className="left-nav-btn">
                                <p className="menu-text"> Login</p>
                            </li>
                            </Link>
                            <Link className="purple-background"
                                style={{
                                    display: 'block',
                                }}
                                to="/register"
                            >
                                <li className="left-nav-btn">
                                <p className="menu-text">Register</p>
                                </li>
                            </Link>

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
