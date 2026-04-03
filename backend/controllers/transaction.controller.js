const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Pour comparer le PIN
const User = require('../models/User'); // Vérifie bien le chemin vers ton modèle User
const Account = require('../models/Account'); // Pour manipuler les comptes
const Transaction = require('../models/Transaction'); // Pour l'historique

/**
 * Créditer le compte
 */
exports.creditAccount = async (req, res) => {
  try {
    const { amount, label } = req.body;
    const account = await Account.findOne({ user: req.user.id });
    
    if (!account) return res.status(404).json({ message: "Compte introuvable" });

    account.balance += Number(amount);
    await account.save();

    await Transaction.create({
      account: account._id,
      type: "CREDIT",
      amount: Number(amount),
      label: label || "Dépôt"
    });

    res.json({ message: "Compte crédité", balance: account.balance });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors du crédit" });
  }
};

/**
 * Débiter le compte
 */
exports.debitAccount = async (req, res) => {
  try {
    const { amount, label } = req.body;
    const account = await Account.findOne({ user: req.user.id });

    if (!account) return res.status(404).json({ message: "Compte introuvable" });
    if (account.balance < amount) return res.status(400).json({ message: "Solde insuffisant" });

    account.balance -= Number(amount);
    await account.save();

    await Transaction.create({
      account: account._id,
      type: "DEBIT",
      amount: Number(amount),
      label: label || "Retrait"
    });

    res.json({ message: "Compte débité", balance: account.balance });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors du débit" });
  }
};

/**
 * Historique complet
 */
exports.getTransactions = async (req, res) => {
  try {
    const account = await Account.findOne({ user: req.user.id });
    if (!account) return res.status(404).json({ message: "Compte introuvable" });

    const transactions = await Transaction.find({ account: account._id })
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Erreur historique" });
  }
};

/**
 * VIREMENT INSTANTANÉ (Transactionnel)
 */


exports.transferMoney = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { recipientIdentifier, amount, label, pin } = req.body;
    const userId = req.user.id;

    // 1. On récupère l'utilisateur pour vérifier son PIN
    const user = await User.findById(userId);
    if (!user) throw new Error("Utilisateur introuvable.");

    // 2. Vérification du PIN (5 chiffres comme convenu)
    const pinValid = await bcrypt.compare(pin.trim(), user.pinHash);
    if (!pinValid) {
      throw new Error("Code PIN de sécurité incorrect.");
    }

    // 3. Identification des comptes (Expéditeur et Destinataire)
    const senderAccount = await Account.findOne({ user: userId }).session(session);
    const recipientAccount = await Account.findOne({
      $or: [
        { accountNumber: recipientIdentifier }, 
        { iban: recipientIdentifier }
      ]
    }).session(session);

    if (!recipientAccount) throw new Error("Bénéficiaire introuvable sur le réseau BPER.");
    if (senderAccount.balance < Number(amount)) throw new Error("Solde insuffisant pour cette transaction.");
    if (Number(amount) <= 0) throw new Error("Montant invalide.");

    // 4. Calcul des nouveaux soldes
    senderAccount.balance -= Number(amount);
    recipientAccount.balance += Number(amount);

    // Sauvegarde sécurisée via session
    await senderAccount.save({ session });
    await recipientAccount.save({ session });

    // 5. Création de l'enregistrement de transaction
    const newTransaction = new Transaction({
      senderAccount: senderAccount._id,
      recipientAccount: recipientAccount._id,
      amount: Number(amount),
      label: label || "Virement SEPA Instantané",
      type: "TRANSFER",
      status: "COMPLETED",
      reference: `BPER-${Math.random().toString(36).toUpperCase().substr(2, 9)}`
    });

    await newTransaction.save({ session });

    // Validation finale de la transaction MongoDB
    await session.commitTransaction();
    session.endSession();

    res.json({ 
      message: "Virement effectué", 
      reference: newTransaction.reference 
    });

  } catch (err) {
    // En cas de pépin, on annule tout l'argent reste à sa place
    await session.abortTransaction();
    session.endSession();
    
    // On renvoie le message d'erreur au frontend (VirementForm.jsx)
    res.status(400).json({ message: err.message });
  }
};

/**
 * VERIFICATION BENEFICIAIRE (Pour auto-remplissage)
 */
exports.checkRecipient = async (req, res) => {
  try {
    const { accountNumber } = req.query;
    console.log("🔍 Vérification reçue pour :", accountNumber); // 👈 REGARDE TON TERMINAL NODE

    if (!accountNumber) {
      return res.status(400).json({ message: "Numéro manquant" });
    }

    // Recherche flexible (String ou Number)
    const account = await Account.findOne({
      $or: [
        { accountNumber: accountNumber.trim() },
        { accountNumber: Number(accountNumber.trim()) }
      ]
    });

    if (!account) {
      console.log("❌ Aucun compte trouvé pour ce numéro.");
      return res.status(404).json({ message: "Introuvable" });
    }

    console.log("✅ Compte trouvé :", account.iban);
    res.json({ 
      iban: account.iban, 
      bic: account.bic || "BPERITM1XXX" 
    });

  } catch (err) {
    console.error("🔥 Erreur serveur :", err);
    res.status(500).json({ message: "Erreur interne" });
  }
};