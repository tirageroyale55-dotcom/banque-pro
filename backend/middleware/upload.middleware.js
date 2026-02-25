const multer = require("multer");

// ✅ stockage mémoire compatible Vercel
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max par fichier
  }
});

module.exports = upload;