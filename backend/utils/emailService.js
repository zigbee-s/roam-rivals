const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOtpEmail(to, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}`,
  };

  await transporter.sendMail(mailOptions);
}

async function sendEventRegistrationEmail(email, eventTitle) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Event Registration Confirmation',
    text: `You have successfully registered for the event: ${eventTitle}`
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

module.exports = { sendOtpEmail, sendEventRegistrationEmail };
