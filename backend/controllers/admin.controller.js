const mongoose = require("mongoose");
const User = require("../models/User");
const Account = require("../models/Account");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const {
  generatePersonalId,
  generateIBAN,
  generateActivationToken
} = require("../utils/generate");
const { sendActivationEmail } = require("../utils/mailer");

exports.validateUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(req.params.id).session(session);

    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    if (user.status !== "PENDING") {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Ce compte a déjà été traité"
      });
    }

    user.status = "ACTIVE";
    user.personalId = generatePersonalId();
    user.activationToken = generateActivationToken();
    user.activationExpires = Date.now() + 1000 * 60 * 60; // 1h

    await user.save({ session });

    await Account.create([{
      user: user._id,
      iban: generateIBAN(),
      rib: generateIBAN().slice(4) // RIB cohérent
    }], { session });

    const link = `${process.env.APP_URL}/activation?token=${user.activationToken}`;

    await sendActivationEmail(user, link);

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: "Client validé, compte créé et email envoyé"
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error(err);
    res.status(500).json({
      message: "Erreur lors de la validation du client"
    });
  }
};

const { sendRejectionEmail } = require("../utils/mailer");
exports.rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    if (user.status !== "PENDING") {
      return res.status(400).json({
        message: "Ce dossier a déjà été traité"
      });
    }

    user.status = "REJECTED";
    await user.save();

    await sendRejectionEmail(user);

    res.json({
      message: "Demande refusée et email envoyé"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Erreur lors du refus du client"
    });
  }
};


exports.getPendingUsers = async (req, res) => {
  const users = await User.find({ status: "PENDING" })
    .select("-pinHash -activationToken");

  res.json(users);
};








exports.sendResetLink = async (req, res) => {
  try {
    const { personalId } = req.body;

    const user = await User.findOne({ personalId });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    const resetLink = `${process.env.APP_URL}/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.verify(); // 🔥 vérifie connexion SMTP

    await transporter.sendMail({
      from: `"Support BPER BANQUE" <${process.env.MAIL_USER}>`,
      to: user.email,
      subject: "Réinitialisation de votre compte",
      html: `
        <p>Bonjour ${user.prenom},</p>
        <p>Pour réinitialiser votre mot de passe et votre PIN :</p>
        <a href="${resetLink}">Réinitialiser mon compte</a>
        <p>Ce lien expire dans 1 heure.</p>
      `
    });

    res.json({ message: "Lien de réinitialisation envoyé avec succès" });

  } catch (err) {
    console.error("RESET ERROR:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};







