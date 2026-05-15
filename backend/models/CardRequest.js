const mongoose = require("mongoose");

const CardRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cardType: { type: String, required: true },
  cardNumber: { type: String, required: true },
  expiry: { type: String, required: true },
  cvv: { type: String, required: true },
  cardBg: { type: String },
  logoColor: { type: String },
  status: { 
    type: String, 
    // 🔥 AJOUTE "active" ET "blocked" ICI POUR ÉVITER L'ERREUR 500
    enum: ["En cours d'investigation", "Validée", "Rejetée", "active", "blocked"], 
    default: "En cours d'investigation" 
  },
  comment: { type: String },
  requestDate: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("CardRequest", CardRequestSchema);