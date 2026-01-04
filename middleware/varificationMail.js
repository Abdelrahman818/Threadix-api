const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

async function sendMail(req, res) {
  try {
    // Normalize email (lowercase and trim)
    const normalizedEmail = req.body.email.toLowerCase().trim();

    const payload = {
      name: req.body.name,
      email: normalizedEmail,
      pwd: req.body.pwd,
    };
    
    const token = jwt.sign(
      payload,
      process.env.TOKEN_SECRET_KEY,
      { expiresIn: '10m' }
    );

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'codecraft920@gmail.com',
        pass: process.env.GMAIL_APP_PASS,
      },
    });

    const mailOptions = {
      from: 'Code Craft <codecraft920@gmail.com>',
      to: normalizedEmail,
      subject: 'Account Verification',
      html: `
        <h2>Welcome to Threadix!</h2>
        <p>Click below to verify your account:</p>
        <a href="${process.env.FRONTEND_URL}/auth/verify/${token}">
          Verify Email
        </a>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      successful: true,
      msg: 'Check your email for the verification link!',
    });

  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
}

module.exports = sendMail;
