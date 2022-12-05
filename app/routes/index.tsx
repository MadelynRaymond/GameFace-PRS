import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { getUser } from "~/session.server";

export async function loader({request}: LoaderArgs) {
  const user = await getUser(request)

  if (user) return redirect(`/${user.email}/stats/overall`)

  return null
}
export default function Index() {
  return (
    <div>
    </div>
  )
  
}