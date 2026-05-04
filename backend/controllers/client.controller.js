const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const User = require("../models/User"); // On ajoute l'import de User

exports.getDashboard = async (req, res) => {
  try {
    // On récupère le compte et on peuple TOUTES les données de l'utilisateur
    const account = await Account.findOne({ user: req.user.id }).populate("user");

    if (!account) return res.status(404).json({ message: "Compte introuvable" });

    const transactions = await Transaction.find({ account: account._id }).sort({ createdAt: -1 }).limit(10);

    // On prépare l'objet utilisateur complet
    const fullUser = account.user;

    res.json({
      // On envoie l'objet user COMPLET (tous les champs du schéma User.jsx)
      user: fullUser, 

      account: {
        balance: account.balance,
        iban: account.iban,
        accountNumber: account.accountNumber
      },

      // Compatibilité pour tes anciens composants (Accounts, BalanceBar)
      balance: account.balance, 
      iban: account.iban,
      firstname: fullUser.prenom,
      lastname: fullUser.nom,
      
      transactions
    });
  } catch (err) {
    console.error("Erreur Dashboard:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};