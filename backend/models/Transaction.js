const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true
  },

  type: {
    type: String,
    enum: ["CREDIT", "DEBIT"],
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  label: {
    type: String,
    default: "Transaction bancaire"
  }
}, { timestamps: true });

module.exports = mongoose.model("Transaction", TransactionSchema);
