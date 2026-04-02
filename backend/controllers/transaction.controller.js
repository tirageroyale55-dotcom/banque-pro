const mongoose = require("mongoose");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction"); // Assure-toi d'avoir ce modèle

exports.transferMoney = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { recipientIdentifier, amount, reason } = req.body;
    const senderId = req.user.id; // Récupéré via ton middleware auth

    // 1. Chercher le compte expéditeur
    const senderAccount = await Account.findOne({ user: senderId }).session(session);
    if (senderAccount.balance < amount) {
      throw new Error("Solde insuffisant");
    }

    // 2. CHERCHE LE DESTINATAIRE (IBAN ou Numéro de compte)
    // C'est ici que la magie opère : on refuse si pas dans la base
    const recipientAccount = await Account.findOne({
      $or: [
        { iban: recipientIdentifier },
        { accountNumber: recipientIdentifier }
      ]
    }).session(session);

    if (!recipientAccount) {
      return res.status(404).json({ 
        message: "Destinataire introuvable. Ce compte n'appartient pas au réseau BPER." 
      });
    }

    if (senderAccount._id.equals(recipientAccount._id)) {
      throw new Error("Opération impossible vers le même compte");
    }

    // 3. Mouvement de fonds
    senderAccount.balance -= Number(amount);
    recipientAccount.balance += Number(amount);

    await senderAccount.save({ session });
    await recipientAccount.save({ session });

    // 4. Historique
    await Transaction.create([{
      sender: senderId,
      recipient: recipientAccount.user,
      amount,
      reason: reason || "Virement Instantané",
      type: "TRANSFER"
    }], { session });

    await session.commitTransaction();
    res.json({ message: "Virement effectué avec succès !" });

  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

/**
 * Créditer le compte (ex: dépôt)
 */
exports.creditAccount = async (req, res) => {
  const { amount, label } = req.body;

  const account = await Account.findOne({ user: req.user.id });

  account.balance += amount;
  await account.save();

  await Transaction.create({
    account: account._id,
    type: "CREDIT",
    amount,
    label
  });

  res.json({ message: "Compte crédité", balance: account.balance });
};

/**
 * Débiter le compte (ex: retrait)
 */
exports.debitAccount = async (req, res) => {
  const { amount, label } = req.body;

  const account = await Account.findOne({ user: req.user.id });

  if (account.balance < amount) {
    return res.status(400).json({ message: "Solde insuffisant" });
  }

  account.balance -= amount;
  await account.save();

  await Transaction.create({
    account: account._id,
    type: "DEBIT",
    amount,
    label
  });

  res.json({ message: "Compte débité", balance: account.balance });
};

/**
 * Historique complet
 */
exports.getTransactions = async (req, res) => {
  const account = await Account.findOne({ user: req.user.id });

  const transactions = await Transaction.find({ account: account._id })
    .sort({ createdAt: -1 });

  res.json(transactions);
};
