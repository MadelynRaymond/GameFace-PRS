import globals from '~/styles/index.css'
import appStyles from '~/styles/app.css'
// styles is now something like /build/global-AE33KB2.css
import type { LoaderArgs, MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, Link, Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData, useNavigate } from '@remix-run/react'
import { getUser } from './session.server'
import Basketball from '~/assets/basketballprofilepic.png'
import { useState } from 'react'
import MobileLinks from './components/MobileLinks'
import NavLinks from './components/NavLinks'

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
        { rel: 'stylesheet preload prefetch', href: 'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,500;0,700;0,900;1,300&display=swap', as: 'style' },
    ]
}

export async function loader({ request }: LoaderArgs) {
    return json({
        user: await getUser(request),
    })
}

function Navbar() {
    const { user } = useLoaderData<typeof loader>()
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()

    const mobileNavigate = (url: string) => {
        setOpen(false)
        navigate(url)
    }

    return (
        <nav className="navbar no-print">
            <p className='nav-logo'>GameFace</p>
            {open && <MobileLinks navigate={mobileNavigate} close={() => setOpen(false)} user={user}/>}
            <NavLinks user={user}/>
            <div className="hamburger" onClick={() => setOpen(!open)}>
                <img width="50px" height="50px" src={Basketball} alt="" />
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
