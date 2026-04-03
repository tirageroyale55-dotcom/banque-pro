const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const User = require("../models/User"); // On ajoute l'import de User

exports.getDashboard = async (req, res) => {
  try {
    // 1. On cherche le compte ET on peuple les infos de l'utilisateur (nom, prenom)
    const account = await Account.findOne({ user: req.user.id }).populate("user", "nom prenom");

    if (!account) {
      return res.status(404).json({ message: "Compte introuvable" });
    }

    const transactions = await Transaction.find({ account: account._id })
      .sort({ createdAt: -1 })
      .limit(10);

    // 2. On renvoie une structure claire pour le Frontend
    res.json({
      user: {
        nom: account.user.nom,
        prenom: account.user.prenom
      },
      account: {
        balance: account.balance,
        iban: account.iban,
        accountNumber: account.accountNumber,
        rib: account.rib,
        bic: account.bic
      },
      transactions
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur dashboard" });
  }
};