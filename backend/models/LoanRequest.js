const mongoose = require("mongoose");

const LoanRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  loanType: { type: String, required: true },
  amount: { type: Number, required: true },
  duration: { type: Number, required: true },
  monthlyPayment: { type: Number, required: true },
  civility: { type: String, required: true },
  lastName: { type: String, required: true },
  firstName: { type: String, required: true },
  income: { type: Number, required: true },
  profession: { type: String, required: true },
  hasCoBorrower: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["PENDING", "APPROVED", "REJECTED"], 
    default: "PENDING" 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("LoanRequest", LoanRequestSchema);