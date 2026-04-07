const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true, 
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

exports.sendFailureEmail = async (userEmail, details) => {
  const mailOptions = {
    from: `"BPER Banca" <${process.env.MAIL_USER}>`,
    to: userEmail,
    subject: "⚠️ Transaction échouée - Alerte Sécurité BPER",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #be123c;">Transaction échouée</h2>
        <p>Ce compte n'est pas autorisé à effectuer des virements internationaux vers le bénéficiaire suivant :</p>
        
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Bénéficiaire :</strong> ${details.beneficiaryName || 'Inconnu'}</p>
          <p><strong>IBAN :</strong> ${details.iban}</p>
          <p><strong>Code BIC :</strong> ${details.bic || 'Non renseigné'}</p>
          <p><strong>Montant :</strong> <span style="color: #be123c; font-weight: bold;">${details.amount} ${details.currency || 'EUR'}</span></p>
        </div>

        <p style="font-size: 14px; color: #666;">
          Pour activer les virements vers cette destination, veuillez contacter immédiatement votre conseiller ou le support technique BPER.
        </p>
        
        <div style="margin-top: 30px; border-top: 1px solid #eee; pt-10px; text-align: center;">
          <p style="font-size: 12px; color: #999;">Ceci est un message automatique, merci de ne pas y répondre.</p>
        </div>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};