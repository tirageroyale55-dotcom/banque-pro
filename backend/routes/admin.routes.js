const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const { rejectUser } = require("../controllers/admin.controller");
const User = require("../models/User");
const Card = require("../models/Card");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");

const {
  validateUser,
  getPendingUsers,
  sendResetLink
} = require("../controllers/admin.controller");

router.get("/user/:id", auth, role("ADMIN"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get("/pending", auth, role("ADMIN"), getPendingUsers);
router.post("/validate/:id", auth, role("ADMIN"), validateUser);
router.post("/reject/:id", auth, role("ADMIN"), rejectUser);

router.post("/admin-send-reset", auth, role("ADMIN"), sendResetLink);

router.post("/card/activate/:id", auth, role("ADMIN"), async (req,res)=>{

const card = await Card.findById(req.params.id);

card.status = "active";

await card.save();

res.json({message:"Carte activée"});

});

router.post("/card/block/:id", auth, role("ADMIN"), async (req,res)=>{

const card = await Card.findById(req.params.id);

card.status = "blocked";

await card.save();

res.json({message:"Carte bloquée"});

});

router.post("/account/block/:id", auth, role("ADMIN"), async (req,res)=>{

  console.log("BLOCK ROUTE HIT"); // 🔥

const account = await Account.findById(req.params.id);
const user = await User.findById(account.user);

// 🔥 AJOUT ICI
account.status = "BLOCKED";
user.status = "BLOCKED";

await account.save();
await user.save();

res.json({message:"Compte bloqué"});

});

router.post("/account/activate/:id", auth, role("ADMIN"), async (req,res)=>{

const account = await Account.findById(req.params.id);
const user = await User.findById(account.user);

// 🔥 AJOUT ICI
account.status = "ACTIVE";
user.status = "ACTIVE";

await account.save();
await user.save();

res.json({message:"Compte activé"});

});

router.get("/client/:id", auth, role("ADMIN"), async (req,res)=>{

try{

const user = await User.findById(req.params.id);

const account = await Account.findOne({user:user._id});

const card = await Card.findOne({user:user._id});

res.json({
user,
account,
card
});

}catch(err){

res.status(500).json({message:"Erreur serveur"});

}

});


router.get("/clients", auth, role("ADMIN"), async (req,res)=>{

try{

const users = await User.find({role:"CLIENT"})
.select("nom prenom email status")

res.json(users)

}catch(err){

res.status(500).json({message:"Erreur serveur"})

}

})





// 1. Récupérer TOUT le profil (User + Account + Card + Transactions)
router.get("/client-full/:id", auth, role("ADMIN"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    const account = await Account.findOne({ user: user._id });
    const card = await Card.findOne({ user: user._id });
    
    // Récupérer les transactions si le compte existe
    let transactions = [];
    if (account) {
      transactions = await Transaction.find({ account: account._id }).sort({ createdAt: -1 });
    }

    res.json({ user, account, card, transactions });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 2. Mettre à jour les infos du client (Modifier Nom, Email, Solde, etc.)
router.put("/client-update/:id", auth, role("ADMIN"), async (req, res) => {
  try {
    const { userData, accountData } = req.body;

    // Mise à jour User
    await User.findByIdAndUpdate(req.params.id, userData);

    // Mise à jour Account (ex: solde)
    if (accountData) {
      await Account.findOneAndUpdate({ user: req.params.id }, accountData);
    }

    res.json({ message: "Données mises à jour avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la mise à jour" });
  }
});

module.exports = router;

