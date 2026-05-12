const nodemailer = require("nodemailer");
const env = require("../config/env");

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.secure,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass,
  },
});

/**
 * Sends a 6-digit OTP to the user's email.
 * @param {string} email
 * @param {string} code
 */
async function sendOTPEmail(email, code) {
  const mailOptions = {
    from: `"${env.smtp.fromName}" <${env.smtp.fromEmail}>`,
    to: email,
    subject: "Verify Your Account - Horizoneinvest",
    text: `Your OTP for Horizoneinvest signup is: ${code}. This code will expire in 10 minutes.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #10b981;">Welcome to Horizoneinvest!</h2>
        <p>Thank you for signing up. Please use the following One-Time Password (OTP) to verify your account:</p>
        <div style="background: #f8fafc; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 5px; color: #0x172a;">${code}</span>
        </div>
        <p style="color: #64748b; font-size: 14px;">This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} Horizoneinvest. All rights reserved.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = {
  sendOTPEmail,
};
