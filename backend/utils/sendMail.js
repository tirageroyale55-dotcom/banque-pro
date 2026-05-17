const nodemailer = require("nodemailer");

const sendMail = async (to, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.com", 
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER, 
        pass: process.env.MAIL_PASS, 
      },
    });

    const mailOptions = {
      from: '"BPER Banca - Services Numériques" <' + process.env.MAIL_USER + '>',
      to: to,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✉️ Notification bancaire officielle envoyée : ", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Erreur d'envoi SMTP Banque :", error);
    throw error;
  }
};

module.exports = sendMail;