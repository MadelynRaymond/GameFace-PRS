import type { LoaderArgs} from '@remix-run/node';
import { json, Response } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import jwtDecode from 'jwt-decode'

type Token = {
  userId?: number
}

export async function loader({request}: LoaderArgs) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')
  const userId = url.searchParams.get("id")

  if(!userId || !token) {
    throw new Response("Not Found", {status: 404})
  }

  const decoded: Token = jwtDecode(token)

  if (decoded.userId && decoded.userId === parseInt(userId)) {
    return null
  }

  throw new Response("Not Authorized", {status: 400})

}

export default function () {

    return (
        <div
            style={{
                height: '75vh',
            }}
            className="form-center"
        >
            <div>
                <h1>Reset Password</h1>
                <input type="text" name="password" id="password" placeholder="Password" />
                <input type="text" name="confirm-password" id="confirm-password" placeholder="Confirm Password" />
                <input type="submit" value="Send reset link" />
            </div>
        </div>
    )
}
