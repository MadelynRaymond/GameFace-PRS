import { Link } from '@remix-run/react'

export default function Register() {
    return (
        <div>
            <div className="registration-form">
                <div className="registration-form-header">
                    <div>
                        <h2>Student-Athlete Registration</h2>
                        <Link to="/login"></Link>

                        <p>
                            Already have an account?{' '}
                            <Link to="/login">
                                <span>Go to login.</span>
                            </Link>
                        </p>
                    </div>

                    <img src="https://static.wixstatic.com/media/b0e244_4c7a1af456f447cea4b26dade5e2d182~mv2_d_1280_1280_s_2.png/v1/fill/w_564,h_564,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/GameFace413_Logo_FINAL.png" alt="" />
                </div>
                <div className="registration-form-row">
                    <div>
                        <label>Athlete First Name</label>
                        <input type="text" placeholder="Ex. John"></input>
                    </div>
                    <div>
                        <label>Athlete Last Name</label>
                        <input type="text" placeholder="Ex. Smith"></input>
                    </div>
                </div>
                <div className="registration-form-row">
                    <div>
                        <label>Username</label>
                        <input type="text" placeholder="Ex. jsmith123"></input>
                    </div>
                    <div>
                        <label>Password</label>
                        <input type="text"></input>
                    </div>
                </div>
                <label>Email</label>
                <input type="text" placeholder="Ex. johnsmith@gmail.com"></input>
                <div className="registration-form-row">
                    <div>
                        <label>Age</label>
                        <input type="text" placeholder="14"></input>
                    </div>
                    <div>
                        <label>Grade</label>
                        <input type="text" placeholder="9th"></input>
                    </div>
                </div>
                <label>School</label>
                <input type="text" placeholder="First Coast High School"></input>
                <div className="register-btn">
                    <button className="register-btn">Register</button>
                </div>
            </div>
        </div>
    )
}
