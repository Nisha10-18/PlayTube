import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.USER,
    pass: process.env.PASSWORD,
  },
});

const sendMail = async (to, otp) => {
  await transporter.sendMail({
    from: process.env.USER,
    to,
    subject: "Reset Your Password",
    html: `
      <p>Your OTP for Password Reset is <b>${otp}</b></p>
      <p>It expires in 5 minutes</p>
    `,
  });
};

export default sendMail;
