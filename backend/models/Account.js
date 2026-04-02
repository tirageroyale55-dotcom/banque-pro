const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  iban: String,
  bic: { type: String, default: "BPERITM1XXX" }, // Code SWIFT fictif pour BPER
  accountNumber: String, // Le numéro de compte pur
  rib: String, // On peut l'utiliser pour le BBAN
  balance: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["ACTIVE", "BLOCKED"],
    default: "ACTIVE"
  }
}, { timestamps: true });

module.exports = mongoose.model("Account", AccountSchema);