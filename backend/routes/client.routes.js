const router = require("express").Router();
const upload = require("../middleware/upload.middleware");
const auth = require("../middleware/auth.middleware");
const User = require("../models/User");
const { getDashboard } = require("../controllers/client.controller");

router.get("/dashboard", auth, getDashboard);

// Route pour l'upload de la photo de profil
router.post("/upload-profile-picture", auth, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier téléchargé" });
    }

    // L'URL de l'image sur Cloudinary est dans req.file.path
    const imageUrl = req.file.path;

    // On met à jour l'utilisateur dans MongoDB
    // req.user.id vient de ton middleware d'authentification
    await User.findByIdAndUpdate(req.user.id, {
      profilePicture: imageUrl 
    });

    res.json({ 
      message: "Photo mise à jour !", 
      url: imageUrl 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de l'upload" });
  }
});

module.exports = router;
