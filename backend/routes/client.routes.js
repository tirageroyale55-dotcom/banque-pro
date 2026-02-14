const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const { getDashboard } = require("../controllers/client.controller");

router.get("/dashboard", auth, getDashboard);

module.exports = router;
