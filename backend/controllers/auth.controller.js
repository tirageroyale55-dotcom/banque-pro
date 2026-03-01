const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
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

    // 4️⃣ Vérifie statut
    if (user.status !== "ACTIVE" || !user.emailVerified) {
      return res.status(403).json({
        message: "Compte non activé"
      });
    }

    // 5️⃣ Vérification PIN
    const pinValid = await bcrypt.compare(pin, user.pinHash);

    if (!pinValid) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      // 🔴 Blocage après 5 tentatives
      if (user.loginAttempts >= 5) {
        user.lockedUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
        await user.save();

        return res.status(403).json({
          message:
            "Compte temporairement bloqué. Contactez l'administrateur."
        });
      }

      await user.save();

      return res.status(401).json({
        message: "Code PIN incorrect"
      });
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
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ ok: false, message: "Email incorrect" });

    // Config nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Banque" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Votre identifiant personnel",
      html: `<p>Bonjour ${user.prenom},</p>
             <p>Votre identifiant personnel est : <b>${user.personalId}</b></p>`,
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
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
    user.loginAttempts = 0; // reset tentative après succès
    await user.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false });
  }
};