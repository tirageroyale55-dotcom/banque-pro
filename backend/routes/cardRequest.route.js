const router = require("express").Router();
const CardRequest = require("../models/CardRequest"); // Vérifie que le modèle existe
const auth = require("../middleware/auth.middleware");

// 1. ROUTE POUR ENREGISTRER LA DEMANDE (Appelée par CardOrderConfirmation)
router.post("/client/request-card", auth, async (req, res) => {
  try {
    const { cardName, number, expiry, cvv, bg, logoColor, comment } = req.body;

    // Suppression d'une ancienne demande si elle existe pour cet utilisateur uniquement
    await CardRequest.deleteMany({ user: req.user.id });

    const newRequest = new CardRequest({
      user: req.user.id, // L'ID vient du token, donc c'est personnel à l'utilisateur
      cardType: cardName,
      cardNumber: number,
      expiry: expiry,
      cvv: cvv,
      cardBg: bg,
      logoColor: logoColor,
      comment: comment,
      status: "En cours d'investigation"
    });

    await newRequest.save();
    res.status(201).json({ message: "Demande enregistrée dans MongoDB" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 2. ROUTE POUR RÉCUPÉRER LA DEMANDE (Appelée par le Dashboard)
router.get("/client/current-request", auth, async (req, res) => {
  try {
    // On cherche UNIQUEMENT la demande liée à l'ID de l'utilisateur connecté
    const request = await CardRequest.findOne({ user: req.user.id });
    if (!request) return res.status(404).json({ message: "Aucune demande" });
    res.json(request);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;