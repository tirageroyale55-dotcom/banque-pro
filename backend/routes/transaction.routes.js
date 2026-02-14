const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const {
  creditAccount,
  debitAccount,
  getTransactions
} = require("../controllers/transaction.controller");

router.post("/credit", auth, creditAccount);
router.post("/debit", auth, debitAccount);
router.get("/", auth, getTransactions);


module.exports = router;
