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
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f6f8;padding:40px">
    <div style="max-width:620px;margin:auto;background:#ffffff;padding:35px;border-radius:12px">

      <h2 style="color:#003A8F;margin-bottom:5px">
        Banque Pro – Activation de votre accès
      </h2>

      <p>Madame, Monsieur <strong>${user.nom}</strong>,</p>

      <p>
        Votre demande d’ouverture de compte a été <strong>validée</strong>.
      </p>

      <p>
        <strong>Identifiant personnel de connexion :</strong>
      </p>

      <div style="
        background:#eef3fb;
        padding:15px;
        border-radius:8px;
        font-size:20px;
        letter-spacing:2px;
        text-align:center;
        margin-bottom:25px
      ">
        ${user.personalId}
      </div>

      <p>
        Afin d’activer votre accès bancaire et définir votre code PIN personnel,
        veuillez cliquer sur le bouton ci-dessous :
      </p>

      <div style="text-align:center;margin:30px 0">
        <a href="${link}" style="
          background:#003A8F;
          color:#ffffff;
          padding:14px 26px;
          border-radius:8px;
          text-decoration:none;
          font-weight:bold;
        ">
          Activer mon accès bancaire
        </a>
      </div>

      <p style="font-size:14px;color:#444">
        Ce lien est valable pendant <strong>1 heure</strong>.
      </p>

      <hr style="margin:30px 0">

      <p style="font-size:12px;color:#777">
        Si vous n’êtes pas à l’origine de cette demande, veuillez ignorer cet email.
        <br><br>
        © BPER Banque  – Service client sécurisé
      </p>

    </div>
  </div>
  `;

  await transporter.sendMail({
    from: `"BPER Banque" <contact@tirageroyale.com>`,
    to: user.email,
    subject: "Activation de votre accès bancaire",
    html
  });
};

exports.sendRejectionEmail = async (user) => {
  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f6f8;padding:40px">
    <div style="max-width:620px;margin:auto;background:#ffffff;padding:35px;border-radius:12px">

      <h2 style="color:#8B0000;margin-bottom:10px">
        Banque Pro – Information concernant votre demande
      </h2>

      <p>Madame, Monsieur <strong>${user.nom}</strong>,</p>

      <p>
        Nous vous remercions de l’intérêt que vous avez porté à Banque Pro.
      </p>

      <p>
        Après analyse de votre dossier, nous regrettons de vous informer
        que votre demande d’ouverture de compte n’a pas pu être acceptée
        à ce stade.
      </p>

      <p style="font-size:14px;color:#444">
        Conformément à nos obligations réglementaires, aucune information
        complémentaire ne peut être communiquée concernant cette décision.
      </p>

      <p>
        Vous avez la possibilité de soumettre une nouvelle demande ultérieurement.
      </p>

      <hr style="margin:30px 0">

      <p style="font-size:12px;color:#777">
        © BPER Banque – Service client<br>
        contact@tirageroyale.com
      </p>

    </div>
  </div>
  `;

  await transporter.sendMail({
    from: `"BPER Banque " <contact@tirageroyale.com>`,
    to: user.email,
    subject: "Information concernant votre demande d’ouverture de compte",
    html
  });
};
