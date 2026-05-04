const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

exports.getDashboard = async (req, res) => {
  try {
    // On garde ton .populate("user") habituel
    const account = await Account.findOne({ user: req.user.id }).populate("user");

    if (!account) return res.status(404).json({ message: "Compte introuvable" });

    // On récupère les transactions SANS les filtrer
    const transactions = await Transaction.find({ account: account._id })
      .sort({ createdAt: -1 })
      .limit(10);

    // ON ENVOIE EXACTEMENT CE QUE TES COMPOSANTS ATTENDENT
    res.json({
      // On envoie l'objet user COMPLET au lieu de juste nom/prenom
      user: account.user, 
      
      account: {
        balance: account.balance,
        iban: account.iban,
        accountNumber: account.accountNumber
      },

      // On garde tes anciennes clés pour ne pas casser Accounts.jsx
      balance: account.balance, 
      iban: account.iban,
      firstname: account.user.prenom,
      lastname: account.user.nom,
      
      // On envoie les transactions avec tous leurs champs (y compris label)
      transactions: transactions 
    });
  } catch (err) {
    console.error("Erreur Dashboard:", err);
    res.status(500).json({ message: "Erreur" });
  }
};