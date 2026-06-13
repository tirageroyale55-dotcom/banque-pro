// backend/services/adminNotification.js
const nodemailer = require("nodemailer");

exports.sendAdminAlert = async (typeAction, user, description = "") => {
  try {
    // Utilisation des variables d'environnement déjà existantes dans votre projet
    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.eu",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const adminEmail = process.env.MAIL_USER; // L'admin reçoit les mails sur son adresse de gestion

    // Construction d'un joli tableau de bord HTML pour l'email de l'admin
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; background-color: #ffffff;">
        <h2 style="color: #004f52; border-bottom: 2px solid #004f52; padding-bottom: 10px; margin-top: 0;">
          🚨 ALERTE SYSTÈME BPER BANCA
        </h2>
        <p style="font-size: 16px; color: #1e293b;">
          Une action importante vient d'être effectuée sur la plateforme.
        </p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 12px; margin: 15px 0; border-radius: 4px;">
          <strong style="color: #0f172a; font-size: 15px;">Événement :</strong> 
          <span style="color: #0369a1; font-weight: bold; font-size: 15px;">${typeAction}</span>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr style="background-color: #f1f5f9;">
            <td style="padding: 8px; font-weight: bold; color: #334155; width: 35%;">Nom / Prénom :</td>
            <td style="padding: 8px; color: #0f172a;">${user.nom ? user.nom.toUpperCase() : "Non défini"} ${user.prenom || ""}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #334155;">Identifiant (ID) :</td>
            <td style="padding: 8px; color: #0f172a; font-family: monospace; font-weight: bold; color: #004f52;">${user.personalId || "Non encore attribué"}</td>
          </tr>
          <tr style="background-color: #f1f5f9;">
            <td style="padding: 8px; font-weight: bold; color: #334155;">Email :</td>
            <td style="padding: 8px; color: #0f172a;">${user.email || "Non défini"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #334155;">Téléphone :</td>
            <td style="padding: 8px; color: #0f172a;">${user.telephone || "Non défini"}</td>
          </tr>
        </table>

        ${description ? `
        <div style="margin-top: 20px; padding: 12px; background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 6px; color: #92400e;">
          <strong style="display: block; margin-bottom: 5px;">Détails de la demande :</strong>
          <span style="white-space: pre-line;">${description}</span>
        </div>` : ""}

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 25px; margin-bottom: 15px;" />
        <p style="font-size: 11px; color: #64748b; text-align: center; margin: 0;">
          Ce message est généré automatiquement par la sécurité applicative de l'environnement de production.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Sécurité BPER" <${process.env.ADMIN_MAIL_USER}>`,
      to: adminEmail,
      subject: `[ALERTE ADMIN] - ${typeAction} - ${user.nom ? user.nom.toUpperCase() : ""} ${user.prenom || ""}`,
      html: htmlContent,
    });

    console.log(`[ALERTE EMAIL] Notification envoyée à l'admin pour l'action : ${typeAction}`);
  } catch (error) {
    console.error("Erreur critique lors de l'envoi du mail d'alerte à l'admin :", error);
  }
};