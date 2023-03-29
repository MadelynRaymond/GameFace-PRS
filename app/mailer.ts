import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'
import { getUserByEmail } from './models/user.server'
import { passwordResetHtml } from './email-template'

export async function sendEmail(
    email: {
        subject: string
        body: string
    },
    recipient: string
) {
    try {

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_TRANSPORT_HOST,
                pass: process.env.EMAIL_APP_PASSWORD,
            },
        })

        transporter.verify(function (error, success) {
            if (error) {
                console.log(error)
            } else {
                console.log('Server is ready to take our messages')
            }
        })


        const email_template_html = `
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
                  <img alt="GameFace" border="0" height="115"
                    src="https://static.wixstatic.com/media/b0e244_4c7a1af456f447cea4b26dade5e2d182~mv2_d_1280_1280_s_2.png/v1/fill/w_564,h_564,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/GameFace413_Logo_FINAL.png"
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
                          Hi <span style="color: #333; text-decoration: none;"> ${recipient},</span><<br />
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
                                  <td align="center" bgcolor="#DF7861" height="57" style="border-radius: 20px"
                                    valign="middle" width="219">
                                    <!-- <a href=""
                                      style="
                                        font-size: 18px;
                                        font-family: Arial, Helvetica,
                                          sans-serif;
                                        font-weight: bold;
                                        color: #ffffff;
                                        text-decoration: none;
                                      " target="_blank"
                                      data-saferedirecturl="">Reset
                                      Password</a>
                                  </td> -->
                                  <div>${email.body}</div>
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
                          <a href=""
                            style="color: #0070c0; text-decoration: underline" target="_blank"
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
                          <span style="font-style: normal"><a
                              href=""
                              style="color: #0070c0; text-decoration: underline" target="_blank"
                              data-saferedirecturl="https://www.gameface413.org/?utm_source=BenchmarkEmail&utm_campaign=March_Newsletter_-_FINAL&utm_medium=email"><span
                                class="il">GameFace</span>.com</a>
                            <a href=""
                              style="color: #0070c0; text-decoration: underline" target="_blank"
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

</body>`
const passwordResetEmailHtml = await passwordResetHtml(recipient, email.body);

        transporter.sendMail({
            
            from: 'GameFace 413 <foo@gamefaceprs.com>',
            to: recipient,
            subject: email.subject,
            html: passwordResetEmailHtml,

        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return error
        } else {
            return new Error('unknown error')
        }
    }
}

//TODO: change secret
export async function createResetToken(userEmail: string): Promise<string | undefined> {
    const user = await getUserByEmail(userEmail)
    if (!user) {
        return undefined
    }

    return jwt.sign(
        {
            data: {
                userId: user.id,
            },
        },
        'SECRET',
        { expiresIn: '5m' }
    )
}
