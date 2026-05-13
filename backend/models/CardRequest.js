const mongoose = require("mongoose");

const CardRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cardType: { type: String, required: true }, // ex: "BPER Classic", "BPER Gold"
  cardNumber: { type: String, required: true },
  expiry: { type: String, required: true },
  cvv: { type: String, required: true },
  cardBg: { type: String }, // Pour conserver le style visuel choisi
  logoColor: { type: String },
  status: { 
    type: String, 
    enum: ["En cours d'investigation", "Validée", "Rejetée"], 
    default: "En cours d'investigation" 
  },
  comment: { type: String }, // Note laissée par l'utilisateur
  requestDate: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("CardRequest", CardRequestSchema);