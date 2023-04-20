import { User } from "@prisma/client"
import { Form, Link } from "@remix-run/react"

export default function NavLinks({user}: {user: Omit<User, 'createdAt' | 'updatedAt'> | null}) {
  if (user) {
    return (
    <ul className="nav-links">
        <Link className="orange-background" to={''}>Main Site</Link>
        {user.role !== 'STAFF' && <Link className="purple-background" to={`/${user.username}/stats`}>My Stats</Link>}
        <Form className="logout-btn orange-background" method="post" action="/logout">
          <button style={{width: '100%', height: '100%'}} type="submit">Logout</button>
        </Form>
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