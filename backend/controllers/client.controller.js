const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const User = require("../models/User"); // On ajoute l'import de User

exports.getDashboard = async (req, res) => {
  try {
    const account = await Account.findOne({ user: req.user.id }).populate("user");

    if (!account) return res.status(404).json({ message: "Compte introuvable" });

    const transactions = await Transaction.find({ account: account._id }).sort({ createdAt: -1 }).limit(10);

    // ON ENVOIE LES DEUX VERSIONS POUR NE RIEN CASSER
    res.json({
      // 1. Version pour VirementForm.jsx (Organisée)
      user: { nom: account.user.nom, prenom: account.user.prenom },
      account: {
        balance: account.balance,
        iban: account.iban,
        accountNumber: account.accountNumber
      },

      // 2. Version pour Accounts.jsx / BalanceBar.jsx (Ancienne structure)
      balance: account.balance, 
      iban: account.iban,
      firstname: account.user.prenom,
      lastname: account.user.nom,
      
      transactions
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur" });
  }
};