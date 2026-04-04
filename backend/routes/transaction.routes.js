const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const {
  creditAccount,
  debitAccount,
  getTransactions,
  transferMoney,
  checkRecipient,
  transferInternational
} = require("../controllers/transaction.controller");

router.post("/credit", auth, creditAccount);
router.post("/debit", auth, debitAccount);
router.get("/", auth, getTransactions);

router.post("/transfer", protect, transferMoney);
router.post("/transfer-international", protect, transferInternational);

router.post("/transfer", auth, transferMoney); 
router.get("/check-recipient", auth, checkRecipient);

module.exports = router;
