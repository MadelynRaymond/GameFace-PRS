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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="hamburger-icon">
                <path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
            </svg>


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
