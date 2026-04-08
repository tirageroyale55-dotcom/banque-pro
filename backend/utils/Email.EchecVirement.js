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
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; text-align: center;">
        
        <div style="margin-bottom: 20px;">
          <span style="display: inline-block; background-color: #ffeef0; padding: 20px; border-radius: 50%;">
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#be123c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </span>
        </div>

        <div style="text-align: left;">
          <h2 style="color: #be123c; text-align: center;">Transaction échouée</h2>
          <p>Ce compte n'est pas autorisé à effectuer des virements internationaux vers le bénéficiaire suivant :</p>
          
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #be123c;">
            <p><strong>Bénéficiaire :</strong> ${details.beneficiaryName || 'Inconnu'}</p>
            <p><strong>IBAN :</strong> ${details.iban}</p>
            <p><strong>Code BIC :</strong> ${details.bic || 'Non renseigné'}</p>
            <p><strong>Montant :</strong> <span style="color: #be123c; font-weight: bold;">${details.amount} ${details.currency || 'EUR'}</span></p>
          </div>

          <p style="font-size: 14px; color: #666;">
            Pour activer les virements vers cette destination, veuillez contacter immédiatement votre conseiller ou le support technique BPER.
          </p>

          <div style="margin: 30px 0; text-align: center;">
            <a href="mailto:support@bper.it" style="background-color: #be123c; color: #ffffff; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Contacter le support immédiatement
            </a>
          </div>
          
          <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; text-align: center;">
            <p style="font-size: 12px; color: #999;">Ceci est un message automatique, merci de ne pas y répondre.</p>
          </div>
        </div>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};