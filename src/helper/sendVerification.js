import { resend } from "../utils/resend.js";


export const sendVerifcationEmail = async (username, email, verifyCode, url) => {
  try {
    const res = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: email,
      subject: "Verification Code",
      html: `Hello <b>${username}</b>, your verifcation code is ${verifyCode}, ${url}`,
    })
    return res
  } catch (error) {
    console.log('Error while sending a email', error);

  }
}