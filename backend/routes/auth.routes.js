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
// ✅ ROUTE AVEC VÉRIFICATION DE DEMANDE UNIQUE EN COURS
// ========================================================
router.post("/apply-loan", auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Action non autorisée. Client non identifié." });
    }

    // 🛑 ÉTAPE CRUCIALE : VÉRIFIER SI UNE DEMANDE EST DÉJÀ EN COURS (PENDING)
    const existingLoan = await LoanRequest.findOne({ 
      user: req.user.id, 
      status: "PENDING" 
    });

    if (existingLoan) {
      return res.status(400).json({ 
        message: "Vous avez déjà une demande de prêt en cours d'analyse. Veuillez attendre la décision de nos analystes avant de soumettre un nouveau dossier." 
      });
    }

    // Si aucune demande en cours, on récupère l'utilisateur pour le dossier
    const dbUser = await User.findById(req.user.id);
    if (!dbUser) {
      return res.status(404).json({ message: "Utilisateur introuvable dans la base de données." });
    }

    const { 
      loanType, amount, duration, monthlyPayment, 
      civility, lastName, firstName, income, profession, hasCoBorrower 
    } = req.body;

    // Création de la demande unique
    const newLoanRequest = new LoanRequest({
      user: req.user.id,
      loanType,
      amount: Number(amount),
      duration: Number(duration),
      monthlyPayment: Number(monthlyPayment),
      civility,
      lastName: lastName || dbUser.nom,
      firstName: firstName || dbUser.prenom,
      email: dbUser.email,        
      telephone: dbUser.telephone,  
      income: Number(income),
      profession: profession || dbUser.situationProfessionnelle, 
      hasCoBorrower,
      status: "PENDING"
    });

    await newLoanRequest.save();

    return res.status(201).json({ 
      message: "Votre demande de prêt a été transmise avec succès aux analystes BPER Banca." 
    });

  } catch (err) {
    console.error("Erreur lors de la soumission du prêt :", err);
    return res.status(500).json({ 
      message: "Erreur interne lors du traitement de votre dossier.",
      details: err.message
    });
  }
});





router.get("/me", auth, async (req, res) => {
  try {
    // On cherche l'utilisateur dans Atlas via son ID décodé par le middleware 'auth'
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    // On renvoie tout l'objet utilisateur (qui contient email et telephone)
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});



// --------------------
// ROUTE TEST SIMPLE (GET)
// --------------------
router.get("/check-user", (req, res) => {
  res.json({ ok: true, message: "Route check-user OK" });
});



module.exports = router;
