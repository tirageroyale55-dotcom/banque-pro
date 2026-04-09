const router = require("express").Router();
const express = require("express");
const upload = require("../middleware/upload.middleware");
const auth = require("../middleware/auth.middleware");
const User = require("../models/User");
const { getDashboard } = require("../controllers/client.controller");

router.get("/dashboard", auth, getDashboard);

// Route pour l'upload de la photo de profil
router.post("/upload-profile-picture", auth, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier reçu" });
    }

    // On récupère l'URL renvoyée par Cloudinary
    const imageUrl = req.file.path;

    // On met à jour le champ profilePicture dans MongoDB
    await User.findByIdAndUpdate(req.user.id, {
      profilePicture: imageUrl
    });

    res.json({ url: imageUrl });
  } catch (error) {
    console.error("Erreur Upload:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
