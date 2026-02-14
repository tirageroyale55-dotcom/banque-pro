const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const { rejectUser } = require("../controllers/admin.controller");

const {
  validateUser,
  getPendingUsers
} = require("../controllers/admin.controller");

router.get("/pending", auth, role("ADMIN"), getPendingUsers);
router.post("/validate/:id", auth, role("ADMIN"), validateUser);
router.post("/reject/:id", auth, role("ADMIN"), rejectUser);

module.exports = router;

