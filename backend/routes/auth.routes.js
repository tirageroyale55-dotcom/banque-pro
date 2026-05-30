const router = require("express").Router();
const express = require("express");
const { applyForAccount } = require("../controllers/auth.controller");
const { activateAccount } = require("../controllers/auth.controller");
const { login } = require("../controllers/auth.controller");
const upload = require("../middleware/upload.middleware");
const User = require("../models/User");
const { sendPersonalId, verifyPassword, changePin } = require("../controllers/auth.controller");
const { resetPassword } = require("../controllers/auth.controller");

const auth = require("../middleware/auth.middleware");
const LoanRequest = require("../models/LoanRequest");


router.post("/login", login);

router.post("/activate", activateAccount);


router.post(
  "/apply",
  upload.fields([
    { name: "pieceIdentiteRecto", maxCount: 1 },
    { name: "pieceIdentiteVerso", maxCount: 1 },
    { name: "justificatifDomicile", maxCount: 1 }
  ]),
  applyForAccount
);


router.post("/check-user", async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();
  const telephone = req.body.telephone?.replace(/\s+/g, "");

  const user = await User.findOne({
    $or: [
      email ? { email } : null,
      telephone ? { telephone } : null
    ].filter(Boolean)
  });

  if (!user) {
    return res.json({ exists: false });
  }

  res.json({
    exists: true,
    status: user.status // PENDING | ACTIVE | REJECTED
  });
});

router.post("/check-id", async (req, res) => {
  const personalId = req.body.personalId?.trim();
  if (!personalId) return res.status(400).json({ exists: false });

  const user = await User.findOne({ personalId });

  if (!user) return res.json({ exists: false });

  // Si le compte est bloqué, on informe le front pour qu'il affiche l'erreur
  if (user.status === "BLOCKED") {
    return res.json({ 
      exists: true, 
      status: "BLOCKED", 
      message: "Ce compte est bloqué. Utilisez le lien de réinitialisation reçu par mail." 
    });
  }

  res.json({ exists: true, status: user.status });
});



// Envoi identifiant
router.post("/send-personal-id", sendPersonalId);

// Vérifier mot de passe pour PIN
router.post("/verify-password", verifyPassword);

// Changer PIN
router.post("/change-pin", changePin);

router.post("/reset-password", resetPassword);





// ========================================================
// ✅ ROUTE SÉCURISÉE & AUTOMATIQUE : PRÊT VIA MONGO DB DIRECT
// ========================================================
router.post("/apply-loan", auth, async (req, res) => {
  try {
    const { 
      loanType, 
      amount, 
      duration, 
      monthlyPayment, 
      civility, 
      lastName, 
      firstName, 
      income, 
      hasCoBorrower 
    } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Action non autorisée. Client non identifié." });
    }

    // 🔥 ALLER CHERCHER LE VRAI UTILISATEUR DIRECTEMENT DANS ATLAS
    const dbUser = await User.findById(req.user.id);
    if (!dbUser) {
      return res.status(404).json({ message: "Utilisateur introuvable dans la base de données." });
    }

    // Extraction des vrais champs requis depuis ton modèle User
    const realEmail = dbUser.email;
    const realTelephone = dbUser.telephone;
    // Si la profession n'est pas définie dans le compte utilisateur, on met "Salarié" par défaut pour éviter le plantage Mongoose
    const realProfession = dbUser.profession || "Salarié"; 

    // Validation de secours si les champs sont vraiment absents du profil de l'utilisateur
    if (!realEmail || !realTelephone) {
      return res.status(400).json({ 
        message: "Votre profil utilisateur est incomplet (E-mail ou Téléphone manquant dans la base)." 
      });
    }

    // Création du prêt avec les données certifiées du serveur
    const newLoanRequest = new LoanRequest({
      user: req.user.id,
      loanType,
      amount: Number(amount),
      duration: Number(duration),
      monthlyPayment: Number(monthlyPayment),
      civility,
      lastName: lastName || dbUser.nom || dbUser.lastName,
      firstName: firstName || dbUser.prenom || dbUser.firstName,
      email: realEmail,        // 🔥 Vrai mail de la base de données
      telephone: realTelephone,  // 🔥 Vrai téléphone de la base de données
      income: Number(income),
      profession: realProfession, // 🔥 Vraie profession ou défaut
      hasCoBorrower,
      status: "PENDING"
    });

    await newLoanRequest.save();

    return res.status(201).json({ 
      message: "Votre demande de prêt a été transmise avec succès aux analystes BPER Banca." 
    });

  } catch (err) {
    console.error("Erreur d'enregistrement du prêt :", err);
    return res.status(500).json({ 
      message: "Erreur lors du traitement de votre dossier par la banque.",
      details: err.message
    });
  }
});



// --------------------
// ROUTE TEST SIMPLE (GET)
// --------------------
router.get("/check-user", (req, res) => {
  res.json({ ok: true, message: "Route check-user OK" });
});



module.exports = router;
