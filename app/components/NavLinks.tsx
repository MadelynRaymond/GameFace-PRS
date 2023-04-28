import { User } from "@prisma/client"
import { Form, Link, useSubmit } from "@remix-run/react"

export default function NavLinks({user}: {user: Omit<User, 'createdAt' | 'updatedAt'> | null}) {
  const submit = useSubmit()

  const logout = () => {
    submit(null, { action: '/logout', method: 'post', replace: true })
  }

  if (user) {
    return (
    <ul className="nav-links">
        {user.role === 'STAFF' && <Link  className="orange-background" to={'/staff/athletes'}>Athletes</Link>}
        {user.role !== 'STAFF' && <Link className="purple-background" to={`/${user.username}/stats`}>My Stats</Link>}
        <Link to={"/logout"} className="orange-background" onClick={logout}>Logout</Link>
        {user.role !== 'STAFF' && <Link className="red-background"to={`/${user.username}/profile`}>Profile</Link>}
    </ul>
    )
  }
  return (
    <ul className='nav-links'>
        <Link className="orange-background" to={'/login'}>Login</Link>
        <Link style={{backgroundColor: '#DF7861'}} to={'/register'}>Register</Link>
    </ul>
  )
}