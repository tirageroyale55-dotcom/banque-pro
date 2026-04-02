const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const {
  creditAccount,
  debitAccount,
  getTransactions,
  transferMoney
} = require("../controllers/transaction.controller");

router.post("/credit", auth, creditAccount);
router.post("/debit", auth, debitAccount);
router.get("/", auth, getTransactions);

// ... tes imports
router.post("/transfer", auth, transferMoney); // <-- AJOUTE ÇA
// ...

module.exports = router;
