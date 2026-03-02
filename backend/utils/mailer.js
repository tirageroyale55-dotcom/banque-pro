const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER, // contact@tirageroyale.com
    pass: process.env.MAIL_PASS  // mot de passe application Zoho
  }
});

exports.sendActivationEmail = async (user, link) => {
  const html = `
  <div style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
      <tr>
        <td align="center">
          
          <table width="100%" style="max-width:480px;background:#ffffff;border-radius:12px;padding:30px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
            
            <tr>
              <td style="font-size:22px;font-weight:bold;color:#1a4fd8;padding-bottom:10px;">
                BPER Banque
              </td>
            </tr>

            <tr>
              <td style="font-size:18px;font-weight:600;color:#333;padding-bottom:20px;">
                Activation de votre accès bancaire
              </td>
            </tr>

            <tr>
              <td style="font-size:14px;color:#555;padding-bottom:20px;">
                Bonjour <b>${user.prenom}</b>,<br><br>
                Votre demande d’ouverture de compte a été validée.
              </td>
            </tr>

            <tr>
              <td style="font-size:14px;color:#555;padding-bottom:10px;">
                Votre identifiant personnel :
              </td>
            </tr>

            <tr>
              <td style="background:#f1f4f8;border-radius:10px;padding:15px;font-size:20px;font-weight:bold;color:#1a4fd8;letter-spacing:2px;">
                ${user.personalId}
              </td>
            </tr>

            <tr>
              <td style="font-size:13px;color:#777;padding-top:20px;">
                Cliquez sur le bouton ci-dessous pour activer votre accès et définir votre code PIN.
              </td>
            </tr>

            <tr>
              <td style="padding-top:25px;">
                <a href="${link}" 
                   style="display:inline-block;padding:12px 20px;background:#1a4fd8;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;">
                  Activer mon accès
                </a>
              </td>
            </tr>

            <tr>
              <td style="font-size:12px;color:#999;padding-top:20px;">
                Ce lien est valable pendant 1 heure.
              </td>
            </tr>

          </table>

          <table width="100%" style="max-width:480px;text-align:center;margin-top:15px;">
            <tr>
              <td style="font-size:12px;color:#999;">
                © ${new Date().getFullYear()} BPER Banque - Tous droits réservés
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
  </div>
  `;

  await transporter.sendMail({
    from: `"BPER Banque" <${process.env.MAIL_USER}>`,
    to: user.email,
    subject: "Activation de votre accès bancaire",
    html
  });
};

exports.sendRejectionEmail = async (user) => {
  const html = `
  <div style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
      <tr>
        <td align="center">
          
          <table width="100%" style="max-width:480px;background:#ffffff;border-radius:12px;padding:30px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
            
            <tr>
              <td style="font-size:22px;font-weight:bold;color:#8B0000;padding-bottom:10px;">
                BPER Banque
              </td>
            </tr>

            <tr>
              <td style="font-size:18px;font-weight:600;color:#333;padding-bottom:20px;">
                Information concernant votre demande
              </td>
            </tr>

            <tr>
              <td style="font-size:14px;color:#555;padding-bottom:20px;">
                Bonjour <b>${user.prenom}</b>,<br><br>
                Après analyse de votre dossier, nous regrettons de vous informer que votre demande d’ouverture de compte n’a pas pu être acceptée.
              </td>
            </tr>

            <tr>
              <td style="font-size:13px;color:#777;">
                Conformément à nos obligations réglementaires, aucun détail supplémentaire ne peut être communiqué.
              </td>
            </tr>

            <tr>
              <td style="font-size:13px;color:#777;padding-top:15px;">
                Vous pouvez soumettre une nouvelle demande ultérieurement.
              </td>
            </tr>

          </table>

          <table width="100%" style="max-width:480px;text-align:center;margin-top:15px;">
            <tr>
              <td style="font-size:12px;color:#999;">
                © ${new Date().getFullYear()} BPER Banque - Tous droits réservés
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
  </div>
  `;

  await transporter.sendMail({
    from: `"BPER Banque" <${process.env.MAIL_USER}>`,
    to: user.email,
    subject: "Information concernant votre demande",
    html
  });
};