const crypto = require("crypto");

exports.generateActivationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

exports.generatePersonalId = () => {
  return "BP-" + Math.floor(100000 + Math.random() * 900000);
};

/**
 * Générateur de données bancaires italiennes (IT37Q...)
 */
exports.generateBankDetails = () => {
  const abi = "05387"; // Code ABI réel de BPER Banca
  const cab = "12100"; // Code CAB (exemple: Rome)
  
  // Générer un numéro de compte de 12 chiffres
  const accountNumber = Math.floor(Math.random() * 900000000000 + 100000000000).toString();
  
  // Construction de l'IBAN (27 caractères au total)
  // IT + 37 (Check) + Q (CIN) + ABI + CAB + AccountNumber
  const iban = `IT37Q${abi}${cab}${accountNumber}`;
  
  return {
    iban,
    accountNumber,
    bic: "BPERITM1XXX", // Format standard SWIFT
    rib: `${abi}${cab}${accountNumber}` // Le BBAN italien
  };
};