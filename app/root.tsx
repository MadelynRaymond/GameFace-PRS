import globals from "~/styles/index.css"
import appStyles from '~/styles/app.css'
// styles is now something like /build/global-AE33KB2.css
import type {  LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { getUser } from "./session.server";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "GameFace PRS",
  viewport: "width=device-width,initial-scale=1",
});

export function links() {
  return [
    { rel: "stylesheet", href: globals },
    { rel: "stylesheet", href: appStyles}
  ]
}

export async function loader({request}: LoaderArgs) {
  return json({user: await getUser(request)})
}

function Navbar() {

  const {user} = useLoaderData<typeof loader>()

  
  return (
    <nav className="navbar">
      <div>
        <div className="logo">
          <Link to={"/"}>
            <img src="https://static.wixstatic.com/media/b0e244_4c7a1af456f447cea4b26dade5e2d182~mv2_d_1280_1280_s_2.png/v1/fill/w_564,h_564,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/GameFace413_Logo_FINAL.png" alt="" />
          </Link>
        </div>
        <div>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to={"/username/stats/overall"}>Stats</Link>
            </li>
          </ul>
        </div>
      </div>

      <div>
        {user ?
          <ul>
            <li>
              <Form method="post" action="/logout">
                <button style={{backgroundColor: 'white'}} type="submit" className="nav-btn">Logout</button>
              </Form>
            </li>
          </ul>
        :
          <ul>
            <li>
              <Link style={{display: "block"}} className="nav-btn" to="/login">Login</Link>
            </li>
            <li>
              <Link style={{display: "block"}} className="nav-btn" id="register" to="/register">Register</Link>
            </li>
          </ul>

        }
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
        <Navbar/>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
