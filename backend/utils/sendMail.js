const nodemailer = require("nodemailer");

const sendMail = async (to, subject, htmlContent) => {
  try {

    // 🔍 CONSOLE DE DÉTECTION CRITIQUE
    console.log("=== 🔴 SÉCURITÉ : VÉRIFICATION DU FICHIER SENDMAIL ===");
    console.log("MAIL_USER récupéré par Vercel :", process.env.MAIL_USER);
    console.log("MAIL_PASS récupéré par Vercel :", process.env.MAIL_PASS ? "Existe ✅" : "VIDE / ABSENT ❌");
    console.log("=====================================================");
    
    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.eu", // 👈 Tu passes de .com à .eu pour aller sur tes serveurs Europe
      port: 465,            // 👈 Tu passes de 587 à 465 (Port SSL officiel pour Zoho Europe)
      secure: true,
      auth: {
        user: process.env.MAIL_USER, 
        pass: process.env.MAIL_PASS, 
      },
    });

    const mailOptions = {
      from: '"Espace Gestion- Services Numériques" <' + process.env.MAIL_USER + '>',
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