const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

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

    if (!personalId || !pin) {
      return res.status(400).json({
        message: "Champs requis manquants"
      });
    }

    // Cherche l'utilisateur par personalId
    const user = await User.findOne({ personalId });

    if (!user) {
      return res.status(401).json({
        message: "Identifiant incorrect"
      });
    }

    // Vérifie que le compte est actif et email vérifié
    if (user.status !== "ACTIVE" || !user.emailVerified) {
      return res.status(403).json({
        message: "Compte non activé"
      });
    }

    // Vérifie le PIN
    const pinValid = await bcrypt.compare(pin, user.pinHash);
    if (!pinValid) {
      return res.status(401).json({
        message: "Code PIN incorrect"
      });
    }

    // Génère token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        personalId: user.personalId,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
