const { BrevoClient } = require("@getbrevo/brevo");

const client = new BrevoClient({ apiKey: process.env.BREVO_SMTP_KEY });

async function sendVerificationEmail(toEmail, toName, token) {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  await client.transactionalEmails.sendTransacEmail({
    subject: "Verify your WanderLust email",
    to: [{ email: toEmail, name: toName }],
    sender: {
      name: "WanderLust",
      email: process.env.SENDER_EMAIL || "no-reply@wanderlust.com",
    },
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; background: #f8f9fa; margin:0; padding:0;">
        <div style="max-width:520px; margin:40px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          <div style="background: linear-gradient(135deg, #f43f5e, #e11d48); padding:36px; text-align:center;">
            <h1 style="color:#fff; margin:0; font-size:28px; font-weight:700;">WanderLust</h1>
            <p style="color:rgba(255,255,255,0.85); margin:8px 0 0; font-size:14px;">Your adventure starts here</p>
          </div>
          <div style="padding:40px 36px;">
            <h2 style="color:#1a1a2e; font-size:22px; margin:0 0 12px;">Hi ${toName}, welcome aboard!</h2>
            <p style="color:#555; font-size:15px; line-height:1.6; margin:0 0 28px;">
              Thanks for signing up. Please verify your email address to activate your account and start exploring amazing properties worldwide.
            </p>
            <div style="text-align:center; margin-bottom:28px;">
              <a href="${verifyUrl}" style="background:linear-gradient(135deg,#f43f5e,#e11d48); color:#fff; text-decoration:none; padding:14px 36px; border-radius:50px; font-size:16px; font-weight:600; display:inline-block; box-shadow:0 4px 14px rgba(244,63,94,0.4);">
                Verify My Email
              </a>
            </div>
            <p style="color:#888; font-size:13px; line-height:1.5; margin:0 0 16px;">
              This link will expire in <strong>24 hours</strong>. If you did not create an account, you can safely ignore this email.
            </p>
            <p style="color:#bbb; font-size:12px; margin:0;">
              Or copy this link:<br/>
              <span style="color:#f43f5e; word-break:break-all;">${verifyUrl}</span>
            </p>
          </div>
          <div style="background:#f8f9fa; padding:20px 36px; text-align:center; border-top:1px solid #eee;">
            <p style="color:#bbb; font-size:12px; margin:0;">2026 WanderLust. Made with love for explorers.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

module.exports = { sendVerificationEmail };