const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  iban: String,
  rib: String,
  balance: { type: Number, default: 0 }
});

module.exports = mongoose.model("Account", AccountSchema);
