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
    const { recipientIdentifier, amount, label, pin } = req.body;
    const userId = req.user.id;

    // 1. Vérification du PIN (doit correspondre au PIN de l'utilisateur connecté)
    const user = await User.findById(userId);
    const pinValid = await bcrypt.compare(pin.trim(), user.pinHash);
    if (!pinValid) {
      throw new Error("Code PIN de sécurité incorrect.");
    }

    // 2. Trouver les comptes
    const senderAccount = await Account.findOne({ user: userId }).session(session);
    const recipientAccount = await Account.findOne({
      $or: [{ accountNumber: recipientIdentifier }, { iban: recipientIdentifier }]
    }).session(session);

    if (!recipientAccount) throw new Error("Bénéficiaire introuvable.");
    if (senderAccount.balance < amount) throw new Error("Solde insuffisant.");

    // 3. Effectuer le transfert (Update au lieu de create pour éviter le bug Vercel/Mongoose)
    senderAccount.balance -= Number(amount);
    recipientAccount.balance += Number(amount);

    await senderAccount.save({ session });
    await recipientAccount.save({ session });

    // 4. Créer l'historique (C'est ici que l'erreur 'create' arrivait)
    // Utilise .save() sur un nouvel objet au lieu de Transaction.create()
    const newTransaction = new Transaction({
      senderAccount: senderAccount._id,
      recipientAccount: recipientAccount._id,
      amount: Number(amount),
      label: label || "Virement SEPA",
      type: "TRANSFER",
      status: "COMPLETED",
      reference: `BPER-${Math.random().toString(36).toUpperCase().substr(2, 9)}`
    });

    await newTransaction.save({ session });

    // Tout est bon, on valide
    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Virement effectué avec succès", reference: newTransaction.reference });

  } catch (err) {
    // En cas d'erreur, on annule tout (Rollback)
    await session.abortTransaction();
    session.endSession();
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