import { Link } from "@remix-run/react";

export default function MobileLinks({user}: {user: boolean}) {

  if (user) {
    return (
      <ul className="nav-links-mobile">
        <Link style={{backgroundColor: 'orange'}} to={'/'}>Main Site</Link>
        <Link style={{backgroundColor: 'blue'}} to={'/'}>My Stats</Link>
        <Link style={{backgroundColor: 'orange'}} to={'/'}>Logout</Link>
        <Link style={{backgroundColor: 'blue'}} to={'/'}>Profile</Link>
      </ul>
    )
  }
  return (
    <ul className='nav-links-mobile'>
        <Link style={{backgroundColor: 'orange'}} to={'/'}>Login</Link>
        <Link style={{backgroundColor: 'blue'}} to={'/'}>Register</Link>
    </ul>
  )
}