import type { User } from '@prisma/client'
import { useSubmit } from '@remix-run/react'
import { Form, Link } from '@remix-run/react'
import { useDetectClickOutside } from 'react-detect-click-outside'

export default function MobileLinks({
    user,
    close,
    navigate,
}: {
    user: Omit<User, 'createdAt' | 'updatedAt'> | null
    close: () => void
    navigate: (url: string) => void
}) {
    const ref = useDetectClickOutside({ onTriggered: close })
    const submit = useSubmit()

    const handleLogout = () => {
        close()
        submit(null, { method: 'post', action: '/logout' })
    }

    if (user) {
        return (
            <ul ref={ref} className="nav-links-mobile">
                {user.role === 'STAFF' && <Link  className="orange-background" onClick={close} to={'/staff/athletes'}>Athletes</Link>}

                {user.role !== 'STAFF' && <Link onClick={close} className="purple-background" to={`/${user.username}/stats`}>
                    My Stats
                </Link>}
                <li className="logout-btn orange-background" onClick={handleLogout}>
                    Logout
                </li>
                {user.role !== 'STAFF' && <Link onClick={close} className="red-background" to={`/${user.username}/profile`}>
                    Profile
                </Link>}
            </ul>
        )
    }
    return (
        <ul ref={ref} className="nav-links-mobile">
            <Link onClick={close} className="orange-background" to={'/login'}>
                Login
            </Link>
            <Link style={{ backgroundColor: '#DF7861' }} to={'/register'}>
                Register
            </Link>
        </ul>
    )
}
