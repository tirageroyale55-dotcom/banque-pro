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
// SOUCHETTE DIRECTE : DEMANDE DE PRÊT (SANS INTERFÉRENCE USER)
// ========================================================
router.post("/apply", auth, async (req, res) => {
  try {
    // 1. Extraction stricte des données du formulaire pour éviter tout conflit avec le modèle User
    const { 
      loanType, 
      amount, 
      duration, 
      monthlyPayment, 
      civility, 
      lastName, 
      firstName, 
      income, 
      profession, 
      hasCoBorrower 
    } = req.body;

    // 2. On vérifie que l'ID de l'utilisateur est bien présent via le middleware auth
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Action non autorisée. Client non identifié." });
    }

    // 3. Création du document Prêt en utilisant directement le modèle LoanRequest
    const newLoanRequest = new LoanRequest({
      user: req.user.id, // Liaison avec l'ID de la session
      loanType,
      amount: Number(amount),
      duration: Number(duration),
      monthlyPayment: Number(monthlyPayment),
      civility,
      lastName,
      firstName,
      income: Number(income),
      profession,
      hasCoBorrower,
      status: "PENDING"
    });

    // 4. Sauvegarde en base de données Atlas
    await newLoanRequest.save();

    // 5. Réponse propre retournée au Front-end
    return res.status(201).json({ 
      message: "Votre demande de prêt a été transmise avec succès aux analystes BPER Banca." 
    });

  } catch (err) {
    console.error("Erreur d'enregistrement du prêt dans auth.routes :", err);
    return res.status(500).json({ 
      message: "Erreur lors du traitement de votre dossier par la banque." 
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
