const nodeMailer = require("nodemailer");

const sendEmail = async (options) => {
  // Configure Nodemailer
  const transporter = nodeMailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'hitendra@ambiplatforms.com',
      pass: 'yiwvbojdtxqnpdpj',
    },
  });

  const mailOptions = {
    from: process.env.SMPT_MAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to send OTP' });
    } else {
      console.log('Email sent: ' + info.response);
      return res.status(200).json({ message: 'OTP sent successfully' });
    }
  });
};

module.exports = sendEmail;
