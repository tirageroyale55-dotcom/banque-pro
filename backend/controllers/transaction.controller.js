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
