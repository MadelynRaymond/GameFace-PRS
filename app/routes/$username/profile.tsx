export default function Profile() {
    return (
  <div>
              <div className="profile-banner">
                  <h2>Welcome back, John!</h2>
                  <div className="profile-btn-group">
                    <button className="btn">Edit Profile</button>
                    <button className="btn">Reset Password</button>
                  </div>
              </div>
              <div className="profile-container">
                  <div className="profile-container-row">
                  <div>
                      <h3>Email</h3>
                      <p>johnsmith@gmail.com</p>
                      </div>
                  <div>
                          <h3>Age</h3>
                          <p>14</p>
                      </div>
                      <div>
                      <h3>Grade</h3>
                      <p>9th</p>
                      </div>
  
  
                  </div>
                  <div className="profile-container-row">
                  <div>
                          <h3>School:</h3>
                          <p>First Coast High School</p>
                      </div>
                      <div>
                          <h3>Emergency Contact</h3>
                          <p>Jane Doe</p>
                      </div>
                      <div>
                          <h3>Emergency Contact Email</h3>
                          <p>janedoe11@yahoo</p>
                      </div>
  
                  </div>   
                     
              </div>
          </div>
    )
}
