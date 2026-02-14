const Account = require("../models/Account");
const Transaction = require("../models/Transaction");

exports.getDashboard = async (req, res) => {
  const account = await Account.findOne({ user: req.user.id });

  if (!account) {
    return res.status(404).json({ message: "Compte introuvable" });
  }

  const transactions = await Transaction.find({ account: account._id })
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({
    balance: account.balance,
    iban: account.iban,
    rib: account.rib,
    transactions
  });
};
