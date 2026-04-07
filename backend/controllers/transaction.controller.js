const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Pour comparer le PIN
const User = require('../models/User'); // Vérifie bien le chemin vers ton modèle User
const Account = require('../models/Account'); // Pour manipuler les comptes
const Transaction = require('../models/Transaction'); // Pour l'historique

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

    // 1. Vérification de l'utilisateur et du PIN
    const user = await User.findById(userId);
    const pinValid = await bcrypt.compare(pin.trim(), user.pinHash);
    if (!pinValid) throw new Error("Code PIN de sécurité incorrect.");

    // 2. Identification des comptes
    const senderAccount = await Account.findOne({ user: userId }).session(session);
    const recipientAccount = await Account.findOne({
      $or: [{ accountNumber: recipientIdentifier }, { iban: recipientIdentifier }]
    }).session(session);

    if (!recipientAccount) throw new Error("Bénéficiaire introuvable.");
    // ❌ EMPECHER L'AUTO-VIREMENT (Sécurité BPER)
    if (senderAccount._id.toString() === recipientAccount._id.toString()) {
      throw new Error("Opération impossible : le compte de destination ne peut pas être le même que le compte d'origine.");
    }
    if (senderAccount.balance < Number(amount)) throw new Error("Solde insuffisant.");

    // 3. Mise à jour des soldes
    senderAccount.balance -= Number(amount);
    recipientAccount.balance += Number(amount);

    await senderAccount.save({ session });
    await recipientAccount.save({ session });

    // 4. CRÉATION DES DEUX ENTRÉES D'HISTORIQUE (Conforme à ton schéma)
    
    // A. L'entrée DEBIT pour l'expéditeur
    const debitEntry = new Transaction({
      account: senderAccount._id, // Requis par ton schéma
      type: "DEBIT",              // Conforme à ton Enum
      amount: Number(amount),
      label: `Virement vers ${recipientAccount.accountNumber} - ${label || 'Sans motif'}`
    });

    // B. L'entrée CREDIT pour le destinataire
    const creditEntry = new Transaction({
      account: recipientAccount._id, // Requis par ton schéma
      type: "CREDIT",                // Conforme à ton Enum
      amount: Number(amount),
      label: `Virement reçu de ${senderAccount.accountNumber} - ${label || 'Sans motif'}`
    });

    // Sauvegarde des deux documents
    await debitEntry.save({ session });
    await creditEntry.save({ session });

    // 5. Validation finale
    await session.commitTransaction();
    session.endSession();

    res.json({ 
      message: "Virement effectué avec succès", 
      reference: debitEntry._id // On utilise l'ID de la transaction comme référence
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: err.message });
  }
};



exports.transferInternational = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { iban, amount, pin, isInstant, label } = req.body;
    const userId = req.user.id;

    // 1. Vérification PIN
    const user = await User.findById(userId);
    const pinValid = await bcrypt.compare(pin.trim(), user.pinHash);
    if (!pinValid) throw new Error("Signature électronique (PIN) incorrecte.");

    // 2. Identification des comptes
    const senderAccount = await Account.findOne({ user: userId }).session(session);
    const recipientAccount = await Account.findOne({ iban: iban }).session(session);

    // ❌ Sécurité : Si l'IBAN n'est pas dans notre base "autorisée"
    if (!recipientAccount) {
      throw new Error("Bénéficiaire non répertorié. La conformité SWIFT bloque ce flux international.");
    }

    if (senderAccount.balance < Number(amount)) throw new Error("Solde insuffisant pour couvrir le transfert et les frais.");

    // 3. EXÉCUTION BANCAIRE
    
    // On débite TOUJOURS l'expéditeur immédiatement
    senderAccount.balance -= Number(amount);
    await senderAccount.save({ session });

    // LOGIQUE 48H : On ne crédite le destinataire QUE si le bouton "Instantané" était coché
    if (isInstant) {
      recipientAccount.balance += Number(amount);
      await recipientAccount.save({ session });
    } else {
      // Pour "Opération Récurrente" ou Standard -> L'argent reste en attente 48h
      console.log("Flux International placé en attente de compensation (48h)");
    }

    // 4. HISTORIQUE
    const status = isInstant ? "COMPLETED" : "PENDING";
    
    const debitEntry = new Transaction({
      account: senderAccount._id,
      type: "DEBIT",
      amount: Number(amount),
      label: `VIR. INTERNATIONALE - ${iban} (${isInstant ? 'INSTANT' : '48H'})`
    });
    await debitEntry.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ 
      message: isInstant ? "Transfert effectué" : "Ordre international enregistré (Exécution sous 48h)", 
      reference: debitEntry._id 
    });

  } catch (err) {
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
    const cleanVal = accountNumber.trim();

    // ✅ RECHERCHE ÉLARGIE : On ajoute l'IBAN à la liste des possibilités
    const account = await Account.findOne({
      $or: [
        { accountNumber: cleanVal }, // Garde la compatibilité avec tes anciens fichiers
        { iban: cleanVal }          // Ajoute la compatibilité pour ton virement international
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