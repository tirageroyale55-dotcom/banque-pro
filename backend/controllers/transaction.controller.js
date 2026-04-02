const Account = require("../models/Account");
const Transaction = require("../models/Transaction");

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




// Ajoute ceci à la fin de ton fichier actuel
exports.transferMoney = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { recipientIdentifier, amount, label } = req.body;
    const amountNum = Number(amount);

    if (amountNum <= 0) throw new Error("Montant invalide");

    // 1. Compte expéditeur
    const senderAcc = await Account.findOne({ user: req.user.id }).session(session);
    if (senderAcc.balance < amountNum) throw new Error("Solde insuffisant");

    // 2. Compte destinataire (Vérification stricte IBAN ou N° Compte)
    const recipientAcc = await Account.findOne({
      $or: [{ iban: recipientIdentifier }, { accountNumber: recipientIdentifier }]
    }).session(session);

    if (!recipientAcc) {
      throw new Error("Destinataire introuvable dans le réseau BPER");
    }

    if (senderAcc._id.equals(recipientAcc._id)) {
      throw new Error("Opération impossible vers le même compte");
    }

    // 3. Mouvement d'argent
    senderAcc.balance -= amountNum;
    recipientAcc.balance += amountNum;

    await senderAcc.save({ session });
    await recipientAcc.save({ session });

    // 4. Historique (un débit pour l'un, un crédit pour l'autre)
    await Transaction.create([
      { account: senderAcc._id, type: "DEBIT", amount: amountNum, label: `VIR vers ${recipientIdentifier} - ${label || ''}` },
      { account: recipientAcc._id, type: "CREDIT", amount: amountNum, label: `VIR de ${senderAcc.iban} - ${label || ''}` }
    ], { session });

    await session.commitTransaction();
    res.json({ message: "Virement instantané réussi" });

  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
};