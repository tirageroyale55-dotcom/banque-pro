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





// ✅ ROUTE AVEC ENGAGEMENT ET SIGNATURE CONTRACTUELLE DIRECTE
router.post("/apply-loan", auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Action non autorisée. Client non identifié." });
    }

    const existingLoan = await LoanRequest.findOne({ 
      user: req.user.id, 
      status: "PENDING" 
    });

    if (existingLoan) {
      return res.status(400).json({ 
        message: "Vous avez déjà une demande de prêt en cours d'analyse. Veuillez attendre la décision de nos analystes." 
      });
    }

    const dbUser = await User.findById(req.user.id);
    if (!dbUser) {
      return res.status(404).json({ message: "Utilisateur introuvable dans la base de données." });
    }

    const { 
      loanType, amount, duration, monthlyPayment, 
      civility, lastName, firstName, income, profession, hasCoBorrower, signatureData 
    } = req.body;

    if (!signatureData) {
      return res.status(400).json({ message: "La signature du contrat de crédit est obligatoire avant soumission." });
    }

    // Génération du texte juridique formel BPER BANCA
    const contractText = `
      CONTRAT DE CRÉDIT PAR PARTICULIER - FORMULAIRE RÉGLEMENTÉ BPER BANCA
      ---------------------------------------------------------------------
      Réf Titre : BPER-${Math.floor(100000 + Math.random() * 900000)}
      Date de génération : ${new Date().toLocaleDateString("fr-FR")}
      
      ENTRE LES SOUSSIGNÉS :
      BPER Banca S.p.A., agissant en qualité d'organisme prêteur,
      ET le Client ci-après désigné :
      Nom / Prénom : ${civility} ${lastName || dbUser.nom} ${firstName || dbUser.prenom}
      Activité Professionnelle : ${profession || dbUser.situationProfessionnelle}
      Revenus Déclarés : ${income} EUR / mois
      
      CARACTÉRISTIQUES DU FINANCEMENT :
      - Type de prêt : ${loanType}
      - Capital Emprunté : ${amount} EUR
      - Durée d'amortissement globale : ${duration} mois
      - Mensualité constante de remboursement : ${monthlyPayment} EUR / mois (Hors assurance optionnelle)
      
      DISPOSITIONS LÉGALES ET SIGNATURE :
      L'emprunteur reconnaît que l'exécution complète des obligations contractuelles découle de la validation finale du dossier par le service des risques de la banque.
      Fait en ligne par consentement numérique certifié.
    `;

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
      status: "PENDING",
      
      // Affectation des éléments de preuve électronique
      contractBody: contractText,
      signatureData: signatureData,
      isSignedByClient: true,
      signedAt: new Date()
    });

    await newLoanRequest.save();

    return res.status(201).json({ 
      message: "Votre contrat a été signé électroniquement et transmis avec succès aux analystes BPER Banca." 
    });

  } catch (err) {
    console.error("Erreur soumission prêt :", err);
    return res.status(500).json({ message: "Erreur interne lors du traitement de votre dossier." });
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get("/my-loans", auth, async (req, res) => {
  try {
    const myLoans = await LoanRequest.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(myLoans);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors du chargement de votre historique" });
  }
});

// --------------------
// ROUTE TEST SIMPLE (GET)
// --------------------
router.get("/check-user", (req, res) => {
  res.json({ ok: true, message: "Route check-user OK" });
});



module.exports = router;
