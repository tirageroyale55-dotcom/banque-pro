const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const Card = require("../models/Card");
const {
generateCardNumber,
generateCVV,
generateExpiry
} = require("../utils/cardGenerator");

// ======================
// Normalisation téléphone
// ======================
const normalizePhone = phone => {
  if (!phone) return null;
  return phone.replace(/\s+/g, "").replace(/^00/, "+");
};

// ======================
// Demande ouverture compte
// ======================
exports.applyForAccount = async (req, res) => {
  try {

console.log("=== Apply Request Received ===");
console.log("BODY:", req.body);
console.log("FILES:", req.files);

    if (!req.body.email || !req.body.telephone) {
      return res.status(400).json({
        message: "Email et téléphone obligatoires"
      });
    }

    const email = req.body.email.toLowerCase().trim();
    const telephone = normalizePhone(req.body.telephone);

    const existingUser = await User.findOne({
      $or: [{ email }, { telephone }]
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Utilisateur déjà enregistré"
      });
    }

    await User.create({
      ...req.body,
      email,
      telephone,
      signature: req.body.signature,
      pieceIdentiteRecto: req.files?.pieceIdentiteRecto?.[0]?.path,
      pieceIdentiteVerso: req.files?.pieceIdentiteVerso?.[0]?.path,
      status: "PENDING"
    });

    return res.status(201).json({
      message: "Demande envoyée"
    });

  } catch (err) {

    if (err.code === 11000) {
      return res.status(409).json({
        message: "Email ou téléphone déjà enregistré"
      });
    }

    return res.status(500).json({
      error: err.message
    });
  }
};

// ======================
// Activation compte
// ======================
exports.activateAccount = async (req, res) => {
  try {
    const { token, password, confirmPassword, pin } = req.body;

    // 1️⃣ Vérifications des champs
    if (!password || !confirmPassword || !pin) {
      return res.status(400).json({
        message: "Tous les champs sont requis (mot de passe, confirmation, PIN)"
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Les mots de passe ne correspondent pas"
      });
    }

    if (!/^\d{5}$/.test(pin)) {
      return res.status(400).json({
        message: "Le PIN doit contenir 5 chiffres"
      });
    }

    // 2️⃣ Recherche de l'utilisateur via le token
    const user = await User.findOne({
      activationToken: token,
      activationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Lien invalide ou expiré"
      });
    }

    // 3️⃣ Hash du mot de passe et du PIN
    user.passwordHash = await bcrypt.hash(password, 10);
    user.pinHash = await bcrypt.hash(pin, 10);

    // 4️⃣ Activation du compte
    user.emailVerified = true;
    user.status = "ACTIVE";
    user.activationToken = undefined;
    user.activationExpires = undefined;

    await user.save();

    // ======================
// CREATION CARTE BANCAIRE
// ======================

const expiry = generateExpiry();

const number = generateCardNumber();

await Card.create({

user:user._id,

brand:"visa",

number:number,

last4:number.slice(-4),

cvv:generateCVV(),

exp_month:expiry.month,

exp_year:expiry.year

});

    // 5️⃣ Réponse
    res.json({
      message: "Compte activé avec succès"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ======================
// LOGIN
// ======================
exports.login = async (req, res) => {
  try {
    const { personalId, pin } = req.body;

    // 1️⃣ Vérification champs
    if (!personalId || !pin) {
      return res.status(400).json({
        message: "Champs requis manquants"
      });
    }

    // 2️⃣ Recherche utilisateur
    const user = await User.findOne({ personalId });

    if (!user) {
      return res.status(401).json({
        message: "Identifiant incorrect"
      });
    }

    // 3️⃣ Vérifier blocage
    if (user.lockedUntil && user.lockedUntil > Date.now()) {
      return res.status(403).json({
        message: "Compte temporairement bloqué. Veuillez contacter l'administrateur."
      });
    }

    // 🚨 🔥 BLOQUAGE ADMIN (AVANT PIN)
if (user.status === "BLOCKED") {
  return res.status(403).json({
    message: "Votre compte est bloqué. Merci de contacter le support client."
  });
}


    // 4️⃣ Vérifie statut
    if (user.status !== "ACTIVE" || !user.emailVerified) {
      return res.status(403).json({
        message: "Compte non activé"
      });
    }

    // 5️⃣ Vérification PIN
    // 5️⃣ Vérification PIN
const pinValid = await bcrypt.compare(pin.trim(), user.pinHash);
if (!pinValid) {
  user.loginAttempts = (user.loginAttempts || 0) + 1;

  // 🔴 Blocage après 5 tentatives : On change le statut en "BLOCKED"
  if (user.loginAttempts >= 5) {
    user.status = "BLOCKED"; // 🔥 On synchronise avec le statut User
    user.lockedUntil = Date.now() + 30 * 60 * 1000; // 30 minutes de sécurité
    await user.save();

    return res.status(403).json({
      message: "Compte bloqué pour des raisons de sécurité. Contactez l'administrateur."
    });
  }

  await user.save();
  return res.status(401).json({ message: "Code PIN incorrect" });
}

    // 6️⃣ Si succès → reset tentatives
    user.loginAttempts = 0;
    user.lockedUntil = null;
    await user.save();

    // 7️⃣ Génération JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 8️⃣ Réponse avec vrai nom
    res.json({
      token,
      user: {
        personalId: user.personalId,
        role: user.role,
        prenom: user.prenom,
        nom: user.nom
      }
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};



// ======================
// Envoi identifiant
// ======================
exports.sendPersonalId = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email requis" });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });

    // ✅ email pas trouvé → message clair
    if (!user) {
      return res.status(404).json({
        message: "Email introuvable"
      });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"BPER Banque" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Votre identifiant personnel",
      html: `
<div style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
    <tr>
      <td align="center">
        
        <!-- CARD -->
        <table width="100%" style="max-width:480px;background:#ffffff;border-radius:12px;padding:30px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          
          <!-- LOGO / TITRE -->
          <tr>
            <td style="font-size:22px;font-weight:bold;color:#1a4fd8;padding-bottom:10px;">
              BPER Banque
            </td>
          </tr>

          <!-- TITRE -->
          <tr>
            <td style="font-size:18px;font-weight:600;color:#333;padding-bottom:20px;">
              Récupération de votre identifiant
            </td>
          </tr>

          <!-- MESSAGE -->
          <tr>
            <td style="font-size:14px;color:#555;padding-bottom:20px;">
              Bonjour <b>${user.prenom}</b>,<br><br>
              Suite à votre demande, nous vous communiquons votre identifiant personnel.
            </td>
          </tr>

          <!-- IDENTIFIANT -->
          <tr>
            <td style="background:#f1f4f8;border-radius:10px;padding:15px;font-size:20px;font-weight:bold;color:#1a4fd8;letter-spacing:2px;">
              ${user.personalId}
            </td>
          </tr>

          <!-- INFO -->
          <tr>
            <td style="font-size:13px;color:#777;padding-top:20px;">
              Pour votre sécurité, ne partagez jamais cet identifiant.<br>
              Si vous n'êtes pas à l'origine de cette demande, contactez immédiatement votre conseiller.
            </td>
          </tr>

          <!-- BOUTON -->
          <tr>
            <td style="padding-top:25px;">
              <a href="${process.env.APP_URL}" 
                 style="display:inline-block;padding:12px 20px;background:#1a4fd8;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;">
                Accéder à mon espace
              </a>
            </td>
          </tr>
                 <p style="font-size:12px;color:#999;margin-top:20px;">
                   Cet email est automatique, merci de ne pas y répondre.
                </p>
        </table>

        <!-- FOOTER -->
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
`
    });

    return res.json({ ok: true });

  } catch (err) {
    console.error("Erreur sendPersonalId:", err);

    // ✅ TOUJOURS renvoyer message propre
    return res.status(500).json({
      message: "Erreur serveur"
    });
  }
};





exports.verifyPassword = async (req, res) => {
  try {
    const { personalId, password } = req.body;
    const user = await User.findOne({ personalId });
    if (!user) return res.json({ ok: false });

    const valid = await bcrypt.compare(password, user.passwordHash);
    res.json({ ok: valid });
  } catch (err) {
    res.status(500).json({ ok: false });
  }
};



exports.changePin = async (req, res) => {
  try {
    const { personalId, pin } = req.body;
    const user = await User.findOne({ personalId });
    if (!user) return res.json({ ok: false });

    user.pinHash = await bcrypt.hash(pin, 10);
    user.loginAttempts = 0;
    user.lockedUntil = null; // 🔥 IMPORTANT
    await user.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false });
  }
};







exports.resetPassword = async (req, res) => {
  try {
    const { token, personalId, password, confirmPassword, pin } = req.body;

    if (!token || !personalId || !password || !confirmPassword || !pin) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Les mots de passe ne correspondent pas" });
    }

    const cleanPin = String(pin).trim(); // ✅ déplacé ici

    if (!/^\d{5}$/.test(cleanPin)) {
      return res.status(400).json({ message: "Le PIN doit contenir 5 chiffres" });
    }

    // Cherche l'utilisateur
    const user = await User.findOne({
      personalId,
      resetToken: token,
      resetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Lien invalide ou expiré" });
    }

    console.log("PIN RESET RECU:", pin);
    console.log("PIN CLEAN:", cleanPin);
    console.log("USER:", user.personalId);

    // ... (code existant pour le hash)
user.passwordHash = await bcrypt.hash(password, 10);
user.pinHash = await bcrypt.hash(cleanPin, 10);

// 🔥 RÉACTIVATION AUTOMATIQUE ICI
user.status = "ACTIVE";           // Le compte redevient actif
user.loginAttempts = 0;           // On remet les erreurs à zéro
user.lockedUntil = null;          // On enlève le verrou de temps
user.emailVerified = true;        // On s'assure qu'il est vérifié

// Nettoyage token
user.resetToken = undefined;
user.resetExpires = undefined;

await user.save();

    await user.save();

    res.json({ message: "Mot de passe et PIN mis à jour avec succès" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};