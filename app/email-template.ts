export async function passwordResetTemplate(recipient: string, resetLink: string): Promise<string> {
  const htmlTemplate = `
  <html>
  <body>
    <table align="center" bgcolor="#e6e6e6" border="0" cellpadding="0" cellspacing="0" style="padding-top: 10px"
      width="100%">
      <tbody>
        <tr>
          <td>
            <table align="center" bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" width="600">
              <tbody>
                <tr>
                  <td align="center" valign="top">
                    <img alt="GameFace" border="0" height="115" src="/app/assets/GameFace413_Logo_FINAL.png"
                      style="display: block" width="115" class="" data-bit="iit" />
                  </td>
                </tr>
                <tr>
                  <td>
                    <table border="0" cellpadding="0" cellspacing="0" width="600">
                      <tbody>
                        <tr>
                          <td style="
                        color: #4e4e4e;
                        font-family: Arial, Helvetica, sans-serif;
                        font-size: 18px;
                        line-height: 27px;
                        padding: 55px 12.5% 40px 12.5%;
                      ">
                            Hi <span style="color: #333; text-decoration: none;"> ${recipient},</span><br/>
                            &nbsp;
                            <h1 style="
                          color: #df7861;
                          display: block;
                          font-family: Arial, Helvetica, sans-serif;
                          font-size: 20px;
                          font-weight: normal;
                          line-height: 24px;
                          font-weight: bold;
                          margin: 0 0 27px 0;
                        ">
                              <span class="il">There was a request to change your password!
                              </span>
                            </h1>
                            If you did not initiate this request, please disregard
                            this email and take no further action. However, if you
                            did, please click on the following link to securely
                            update your password.
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 0 12.5%">
                            <center>
                              <table border="0" cellpadding="0" cellspacing="0" style="display: inline-block">
                                <tbody>
                                  <tr>
                                    <div>${resetLink}</div>
                                  </tr>
                                </tbody>
                              </table>
                            </center>
                          </td>
                        </tr>
                        <tr>
                          <td style="
                        color: #4e4e4e;
                        font-family: Arial, Helvetica, sans-serif;
                        font-size: 18px;
                        line-height: 27px;
                        padding: 40px 12.5% 50px 12.5%;
                      ">
                            Ensuring the security and privacy of your account is
                            our top priority, and look forward to having you back
                            soon on the Gameface PRS!

                            <br />
                            <!-- <br />
                      This request to reset your password will expire after 5 mins
                      <br /> -->
                            <br />
                            Sincerely,<br />
                            Ashanti Jackson<br />
                            Chief Executive Officer
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td bgcolor="#e6e6e6">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                      <tbody>
                        <tr>
                          <td style="
                        color: #666666;
                        font-family: Arial, Helvetica, sans-serif;
                        font-size: 14px;
                        font-style: italic;
                        letter-spacing: -0.2px;
                        line-height: 21px;
                        padding: 30px 7.5% 45px 7.5%;
                      ">
                            <strong style="
                          font-size: 18px;
                          line-height: 27px;
                          font-style: normal;
                        ">This request to reset your password will expire
                              after 5 mins</strong><br />
                            <br />
                            This email is conducted on behalf of
                            <span class="il">Gameface 4:13 Training Academy.</span>
                            You have received this
                            <span class="il">Password Reset</span> email link
                            because you provided
                            <span class="il">GameFace</span> your email address,
                            either in person or via their web site, and you
                            recently visited
                            <span class="il">the Gameface Performace Review System</span>. Please do not forward this
                            email to others because
                            you have been given a unique URL that can change your
                            account password.<br />
                            <br />
                            Please do not reply directly to this email as all
                            replies go to an unattended inbox. If you’d like to
                            contact <span class="il">GameFace 4:13</span>, please
                            <a href="" style="color: #0070c0; text-decoration: underline" target="_blank"
                              data-saferedirecturl="">submit
                              a request</a>
                            online.<br />
                            <br />
                            <strong><span class="il">Gameface 4:13 Training Academy</span></strong><br />
                            6001 Argyle Forest Blvd Suite 21 PMB 31,<br />
                            Jacksonville, FL 32244-6664<br />
                            (904)-878-9911<br />
                            <br />
                            © 2022
                            <span class="il">GameFace 4:13 Training Academy.</span>
                            All rights reserved.<br />
                            <br />
                            <span style="font-style: normal"><a href=""
                                style="color: #0070c0; text-decoration: underline" target="_blank"
                                data-saferedirecturl="https://www.gameface413.org/?utm_source=BenchmarkEmail&utm_campaign=March_Newsletter_-_FINAL&utm_medium=email"><span
                                  class="il">GameFace</span>.com</a>
                              <a href="" style="color: #0070c0; text-decoration: underline" target="_blank"
                                data-saferedirecturl="">Privacy
                                Policy</a></span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>

  </html>`
  return htmlTemplate
  }