const router = require("express").Router();
const CardRequest = require("../models/CardRequest");
const auth = require("../middleware/auth.middleware");

// Enregistrer une nouvelle demande de carte
router.post("/client/request-card", auth, async (req, res) => {
  try {
    const { cardName, number, expiry, cvv, bg, logoColor, comment } = req.body;

    const newRequest = new CardRequest({
      user: req.user.id,
      cardType: cardName,
      cardNumber: number,
      expiry: expiry,
      cvv: cvv,
      cardBg: bg,
      logoColor: logoColor,
      comment: comment
    });

    await newRequest.save();
    res.status(201).json({ message: "Demande enregistrée avec succès", data: newRequest });
  } catch (e) {
    res.status(500).json({ error: "Erreur lors du traitement de la demande bancaire" });
  }
});

// Récupérer la demande en cours pour le Dashboard
router.get("/client/current-request", auth, async (req, res) => {
  try {
    const request = await CardRequest.findOne({ user: req.user.id }).sort({ requestDate: -1 });
    res.json(request);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;