const router = require("express").Router();
const CardRequest = require("../models/CardRequest");
const auth = require("../middleware/auth.middleware");

// L'URL finale sera /api/client/request-card
router.post("/request-card", auth, async (req, res) => {
  try {
    const { cardName, number, expiry, cvv, bg, logoColor, comment } = req.body;

    await CardRequest.deleteMany({ user: req.user.id });

    const newRequest = new CardRequest({
      user: req.user.id,
      cardType: cardName, // On mappe cardName du front vers cardType du back
      cardNumber: number,
      expiry: expiry,
      cvv: cvv,
      cardBg: bg,
      logoColor: logoColor,
      comment: comment
    });

    await newRequest.save();
    res.status(201).json({ message: "Succès" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// L'URL finale sera /api/client/current-request
router.get("/current-request", auth, async (req, res) => {
  try {
    const request = await CardRequest.findOne({ user: req.user.id });
    if (!request) return res.status(404).json({ message: "Vide" });
    res.json(request);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;