const router = require("express").Router();
const CardRequest = require("../models/CardRequest");
const auth = require("../middleware/auth.middleware");

// 1. POST : Enregistrer la demande (Seulement pour l'utilisateur connecté)
router.post("/client/request-card", auth, async (req, res) => {
  try {
    // On force l'ID de l'utilisateur issu du token (req.user.id)
    const newRequest = new CardRequest({
      user: req.user.id, 
      cardType: req.body.cardName,
      cardNumber: req.body.number,
      expiry: req.body.expiry,
      cvv: req.body.cvv,
      cardBg: req.body.bg,
      logoColor: req.body.logoColor,
      status: "En cours d'investigation"
    });

    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 2. GET : Récupérer UNIQUEMENT la demande de cet utilisateur
router.get("/client/current-request", auth, async (req, res) => {
  try {
    // FILTRE CRUCIAL : On ne cherche que les cartes de l'USER ID connecté
    const request = await CardRequest.findOne({ user: req.user.id }).sort({ requestDate: -1 });
    if (!request) return res.status(404).json({ message: "Aucune demande" });
    res.json(request);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;