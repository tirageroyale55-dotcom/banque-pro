const mongoose = require("mongoose");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");

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
    const { recipientIdentifier, amount, label } = req.body;
    const amountNum = Number(amount);

    if (amountNum <= 0) throw new Error("Montant invalide");

    const senderAcc = await Account.findOne({ user: req.user.id }).session(session);
    if (!senderAcc) throw new Error("Votre compte est introuvable");
    if (senderAcc.balance < amountNum) throw new Error("Solde insuffisant");

    // Recherche par IBAN ou Numéro de compte
    const recipientAcc = await Account.findOne({
      $or: [{ iban: recipientIdentifier }, { accountNumber: recipientIdentifier }]
    }).session(session);

    if (!recipientAcc) throw new Error("Destinataire introuvable dans le réseau BPER");
    if (senderAcc._id.equals(recipientAcc._id)) throw new Error("Opération impossible vers le même compte");

    senderAcc.balance -= amountNum;
    recipientAcc.balance += amountNum;

    await senderAcc.save({ session });
    await recipientAcc.save({ session });

    await Transaction.create([
      { account: senderAcc._id, type: "DEBIT", amount: amountNum, label: `VIR vers ${recipientIdentifier} - ${label || ''}` },
      { account: recipientAcc._id, type: "CREDIT", amount: amountNum, label: `VIR de ${senderAcc.iban} - ${label || ''}` }
    ], { session });

    await session.commitTransaction();
    res.json({ message: "Virement instantané réussi", balance: senderAcc.balance });

  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
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