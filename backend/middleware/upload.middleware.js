const multer = require("multer");
const fs = require("fs");
const path = require("path");

// définit le chemin uploads absolu
const uploadPath = path.join(__dirname, "..", "uploads");

// crée le dossier si inexistant
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

module.exports = multer({ storage });