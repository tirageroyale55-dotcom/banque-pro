const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  iban: { type: String, required: true },
  rib: { type: String },
  balance: { type: Number, default: 0 },
  status: { type: String, enum: ["ACTIVE", "BLOCKED"], default: "ACTIVE" }
}, { timestamps: true });

module.exports = mongoose.model("Account", AccountSchema);