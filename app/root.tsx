import globals from "~/styles/index.css"
import appStyles from '~/styles/app.css'
// styles is now something like /build/global-AE33KB2.css
import type { MetaFunction } from "@remix-run/node";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

export function links() {
  return [
    { rel: "stylesheet", href: globals },
    { rel: "stylesheet", href: appStyles}
  ]
}

function Navbar() {
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
        <ul>
          <li id="login-btn">
            <Link to="/login">Login</Link>
          </li>
          <li id="register">
            <Link to="/register">Register</Link>
          </li>
        </ul>
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
