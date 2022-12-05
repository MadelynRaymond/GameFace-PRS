import { Link } from "@remix-run/react";

export default function Login() {
    return (
        <div style={{height: 'calc(100vh - 160px'}} className="login-container">
            <form id="login" className='box'>
                <h1>Login</h1>
                <label>Username</label>
                <input type="text" name="name" id="name" placeholder="Username"/>
                <label>Password</label>
                <input type="Password" name="pass" id="pass" placeholder="Password"/>
                <input type="button" name="login"value="Login"/>
                
                <span>Remember me</span>
                <input style={{display: 'inline'}} type="checkbox" id="check"/>
                <Link to="/forgot-password">Forgot password?</Link>
            </form>
        </div>
    )
}