const mongoose = require("mongoose");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const UserSchema = new mongoose.Schema(
{
  // ======================
  // STATUT
  // ======================
  status: {
    type: String,
    enum: ["PENDING", "ACTIVE", "REJECTED"],
    default: "PENDING"
  },

  // ======================
  // IDENTITÉ
  // ======================
  civilite: {
    type: String,
    enum: ["M", "Mme"],
    required: true
  },

  nom: { type: String, required: true, trim: true },
  prenom: { type: String, required: true, trim: true },

  dateNaissance: { type: String, required: true },
  lieuNaissance: { type: String, required: true, trim: true },

  nationalite: { type: String, required: true, trim: true },
  residenceFiscale: { type: String, trim: true },

  // ======================
  // CONTACT
  // ======================
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: emailRegex
  },

  telephone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^\+\d{7,15}$/
  },

  adresse: { type: String, required: true, trim: true },
  codePostal: { type: String, required: true, trim: true },
  ville: { type: String, required: true, trim: true },
  pays: { type: String, required: true, trim: true },

  // ======================
  // FINANCIER
  // ======================
  situationProfessionnelle: { type: String, required: true },
  sourceRevenus: { type: String, required: true },

  revenusMensuels: {
    type: Number,
    required: true,
    min: 0
  },

  // ======================
  // DOCUMENTS
  // ======================
  pieceIdentiteRecto: String,
  pieceIdentiteVerso: String,
 
  signature: String,

  // ======================
  // CONSENTEMENT
  // ======================
  acceptContrat: {
    type: Boolean,
    required: true,
    validate: {
      validator: v => v === true,
      message: "Le contrat doit être accepté"
    }
  },

  // ======================
  // COMPTE / SÉCURITÉ
  // ======================
  personalId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  
  passwordHash: String,
  pinHash: String,

  activationToken: String,
  activationExpires: Date,

  emailVerified: {
    type: Boolean,
    default: false
  },

  role: {
    type: String,
    enum: ["ADMIN", "CLIENT"],
    default: "CLIENT"
  },
  
  loginAttempts: { type: Number, default: 0 }, // compteur de tentatives
  lockedUntil: { type: Date }                // date jusqu'à laquelle le compte est bloqué
},
{ timestamps: true }
);


module.exports = mongoose.model("User", UserSchema);
