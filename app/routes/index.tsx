import type { LoaderArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { getUser, logout } from '~/session.server'

export async function loader({ request }: LoaderArgs) {
    const user = await getUser(request)

    if (user) return redirect(`/${user.username}/stats`)

    throw await logout(request)
}
export default function Index() {
    return <div></div>
}
