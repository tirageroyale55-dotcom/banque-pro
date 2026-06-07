// backend/models/SupportTicket.js
const mongoose = require("mongoose");

const SupportTicketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  category: {
    type: String,
    enum: ["TECHNICAL_SUPPORT", "CARD_ISSUE", "TRANSACTION_DISPUTE", "LOAN_FOLLOW_UP", "COMPLIANCE_DOCS"],
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"],
    default: "OPEN"
  },
  adminReply: {
    type: String, // Pour stocker la réponse de l'admin plus tard
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("SupportTicket", SupportTicketSchema);