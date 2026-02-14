require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const password = "Admin@1234";
  const pin = "97708";

  const passwordHash = await bcrypt.hash(password, 10);
  const pinHash = await bcrypt.hash(pin, 10);

  const admin = new User({
    civilite: "M",
    nom: "ADMIN",
    prenom: "ROOT",
    dateNaissance: "1990-01-01",
    lieuNaissance: "SYSTEM",
    nationalite: "SYSTEM",
    residenceFiscale: "SYSTEM",

    email: "tirageroyale55@gmail.com",
    telephone: "+33600000000",

    adresse: "SYSTEM",
    codePostal: "00000",
    ville: "SYSTEM",
    pays: "SYSTEM",

    situationProfessionnelle: "ADMIN",
    sourceRevenus: "SYSTEM",
    revenusMensuels: 0,

    acceptContrat: true,

    role: "ADMIN",
    status: "ACTIVE",
    emailVerified: true,

    personalId: "ADMIN001",

    passwordHash,
    pinHash
  });

  await admin.save();

  console.log("✅ ADMIN créé : ADMIN001 / Admin@1234 / 97708");
  process.exit();
})();
