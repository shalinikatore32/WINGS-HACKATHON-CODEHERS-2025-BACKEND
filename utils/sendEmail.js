const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, content) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: subject,
    html: content,
  });
};

module.exports = sendEmail;
