const crypto = require("crypto");

exports.generateActivationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

exports.generatePersonalId = () => {
  return "BP-" + Math.floor(100000 + Math.random() * 900000);
};

exports.generateIBAN = () => {
  return "FR76" + Math.random().toString().slice(2, 14);
};
