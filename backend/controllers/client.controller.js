const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const User = require("../models/User"); // 👈 N'oublie pas d'importer le modèle User !

exports.getDashboard = async (req, res) => {
  try {
    // 1. Récupérer le compte de l'utilisateur
    const account = await Account.findOne({ user: req.user.id });
    if (!account) {
      return res.status(404).json({ message: "Compte introuvable" });
    }

    // 2. Récupérer les infos de l'utilisateur (pour le Nom/Prénom)
    const user = await User.findById(req.user.id).select("nom prenom email telephone status");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    // 3. Récupérer les dernières transactions
    const transactions = await Transaction.find({ account: account._id })
      .sort({ createdAt: -1 })
      .limit(10);

    // 4. On renvoie TOUT dans un seul objet structuré
    res.json({
      user: {
        nom: user.nom,
        prenom: user.prenom,
        status: user.status
      },
      account: {
        balance: account.balance,
        iban: account.iban,
        rib: account.rib,
        accountNumber: account.accountNumber, // 👈 Ajouté pour l'affichage
        bic: account.bic
      },
      transactions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur lors de la récupération du dashboard" });
  }
};
