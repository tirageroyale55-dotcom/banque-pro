const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const User = require("../models/User"); // On ajoute l'import de User

exports.getDashboard = async (req, res) => {
  try {
    // .lean() permet de récupérer un objet JS pur, plus facile à manipuler
    const account = await Account.findOne({ user: req.user.id })
      .populate("user")
      .lean();

    if (!account) return res.status(404).json({ message: "Compte introuvable" });

    // Récupère les transactions et transforme-les en JSON pur
    const transactions = await Transaction.find({ account: account._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      user: account.user, // Contient maintenant TOUT le profil (email, adresse, etc.)
      account: {
        balance: account.balance,
        iban: account.iban,
        accountNumber: account.accountNumber
      },
      // Ces lignes assurent la compatibilité avec tes anciens composants
      balance: account.balance, 
      iban: account.iban,
      firstname: account.user.prenom,
      lastname: account.user.nom,
      
      transactions // Contient maintenant les objets avec le champ 'label'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur" });
  }
};