const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const { rejectUser } = require("../controllers/admin.controller");
const User = require("../models/User");
const Card = require("../models/Card");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const CardRequest = require("../models/CardRequest");

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

res.json({ user, account, card });

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







// GET : Récupérer l'intégralité du dossier (User + Account + Card + Transactions + cardRequest)
router.get("/client-master-data/:id", auth, role("ADMIN"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const account = await Account.findOne({ user: user._id });
    const card = await Card.findOne({ user: user._id });
    const transactions = account ? await Transaction.find({ account: account._id }).sort({ createdAt: -1 }) : [];
    const cardRequest = await CardRequest.findOne({ user: user._id }).sort({ requestDate: -1 });

    res.json({ user, account, card, transactions, cardRequest });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération totale" });
  }
});


router.put("/client-master-update/:id", auth, role("ADMIN"), async (req, res) => {
  try {
    const { userData, accountData, cardData, cardRequestData } = req.body; // Ajout de cardRequestData
    
    if (userData) await User.findByIdAndUpdate(req.params.id, userData);
    if (accountData) await Account.findOneAndUpdate({ user: req.params.id }, accountData);
    if (cardData) await Card.findOneAndUpdate({ user: req.params.id }, cardData);
    
    // 🔥 AJOUT : Met à jour la demande de carte si elle est envoyée
    if (cardRequestData) {
      await CardRequest.findOneAndUpdate({ user: req.params.id }, cardRequestData);
    }
    
    res.json({ message: "Mise à jour globale réussie" });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la mise à jour" });
  }
});

router.post("/card-request-decision/:requestId", auth, role("ADMIN"), async (req, res) => {
  try {
    const { decision } = req.body;
    
    // CAS SPÉCIAL : REJETER ET SUPPRIMER
    if (decision === "delete") {
      await CardRequest.findByIdAndDelete(req.params.requestId);
      return res.json({ message: "Demande rejetée et supprimée de la base." });
    }

    // AUTRES CAS : ACTIVER / BLOQUER
    const request = await CardRequest.findByIdAndUpdate(
      req.params.requestId,
      { status: decision, updatedAt: Date.now() },
      { new: true }
    );

    if (!request) return res.status(404).json({ message: "Demande introuvable" });

    res.json({ message: "Statut mis à jour", status: request.status });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;

