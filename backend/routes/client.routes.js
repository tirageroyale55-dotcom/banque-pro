const router = require("express").Router();
const express = require("express");
const upload = require("../middleware/upload.middleware");
const auth = require("../middleware/auth.middleware");
const User = require("../models/User");
const { getDashboard } = require("../controllers/client.controller");

router.get("/dashboard", auth, getDashboard);

// Route pour l'upload de la photo de profil
// routes/client.routes.js
router.post("/upload-profile-picture", auth, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Image non reçue" });
    
    // On sauvegarde l'URL de Cloudinary dans MongoDB
    await User.findByIdAndUpdate(req.user.id, { profilePicture: req.file.path });
    
    res.json({ url: req.file.path });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
