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

const OTP_PURPOSE = {
  signup: "signup",
  passwordReset: "password_reset",
};

/**
 * Sends a 6-digit code by email (signup verification or password reset).
 * @param {string} email
 * @param {string} code
 * @param {"signup"|"password_reset"} [purpose]
 */
async function sendOTPEmail(email, code, purpose = OTP_PURPOSE.signup) {
  const isReset = purpose === OTP_PURPOSE.passwordReset;
  const subject = isReset ? "Reset your password - Horizoneinvest" : "Verify your account - Horizoneinvest";
  const text = isReset
    ? `Your Horizoneinvest password reset code is: ${code}. It expires in 10 minutes. If you did not request this, ignore this email.`
    : `Your Horizoneinvest signup verification code is: ${code}. It expires in 10 minutes.`;
  const html = isReset
    ? `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #0f172a;">Password reset</h2>
        <p>Use this code to choose a new password:</p>
        <div style="background: #f8fafc; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 5px; color: #0f172a;">${code}</span>
        </div>
        <p style="color: #64748b; font-size: 14px;">Valid for 10 minutes. If you did not request a reset, you can ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} Horizoneinvest</p>
      </div>
    `
    : `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #10b981;">Welcome to Horizoneinvest!</h2>
        <p>Thank you for signing up. Use this code to verify your account:</p>
        <div style="background: #f8fafc; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 5px; color: #0f172a;">${code}</span>
        </div>
        <p style="color: #64748b; font-size: 14px;">This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} Horizoneinvest. All rights reserved.</p>
      </div>
    `;

  const mailOptions = {
    from: `"${env.smtp.fromName}" <${env.smtp.fromEmail}>`,
    to: email,
    subject,
    text,
    html,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = {
  sendOTPEmail,
  OTP_PURPOSE,
};
