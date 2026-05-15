const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const { rejectUser } = require("../controllers/admin.controller");
const User = require("../models/User");
const Card = require("../models/Card");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const CardRequest = require("../models/CardRequest");
const nodemailer = require("nodemailer");

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
    const { decision, message } = req.body; 
    
    // On cherche la demande et l'utilisateur pour avoir son email
    const request = await CardRequest.findById(req.params.requestId).populate("user");
    if (!request) return res.status(404).json({ message: "Demande introuvable" });

    // --- CAS : REJETER ET SUPPRIMER AVEC ENVOI DE MAIL ---
    if (decision === "delete") {
      const transporter = nodemailer.createTransport({
        host: "smtp.zoho.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.MAIL_USER, // contact@tirageroyale.com
          pass: process.env.MAIL_PASS  // mot de passe application Zoho
        }
      });

      const mailOptions = {
        from: `"BPER Banca - Service Cartes" <${process.env.MAIL_USER}>`,
        to: request.user.email,
        subject: "Notification de décision : Demande de carte - BPER Banca",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; border: 1px solid #e2e8f0; padding: 25px; color: #334155;">
            <h2 style="color: #005a64; margin-top: 0;">BPER: <span style="font-weight: normal;">Banca</span></h2>
            <div style="border-bottom: 2px solid #005a64; margin-bottom: 20px;"></div>
            <p>Cher(e) client(e),</p>
            <p>Nous vous informons qu'une décision a été prise concernant votre demande de carte bancaire <strong>${request.cardType}</strong>.</p>
            <p>Après examen de votre dossier par notre service compétent, nous avons le regret de vous informer que votre demande a été <strong>rejetée</strong>.</p>
            <div style="background-color: #f8fafc; padding: 15px; border-left: 5px solid #dc2626; margin: 20px 0;">
              <strong style="color: #dc2626;">Motif du rejet :</strong><br/>
              <p style="margin-top: 8px; font-style: italic;">"${message || "Votre dossier ne répond pas aux critères d'éligibilité actuels de notre établissement."}"</p>
            </div>
            <p>Conformément à nos procédures de sécurité, cette demande a été clôturée. Vous pouvez contacter votre conseiller dédié pour plus de précisions.</p>
            <br/>
            <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
              Cordialement,<br/>
              <strong>Direction de la Relation Client - BPER Banca</strong><br/>
              <span style="font-size: 11px;">Ceci est un message automatique. Merci de ne pas y répondre.</span>
            </p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      await CardRequest.findByIdAndDelete(req.params.requestId);
      
      return res.json({ message: "La demande a été rejetée, le mail envoyé et le dossier supprimé." });
    }

    if (decision === "active") {
      const mailSucces = {
        from: `"BPER Banca - Service Cartes" <${process.env.MAIL_USER}>`,
        to: request.user.email,
        subject: "Votre carte BPER est désormais active !",
        html: `
          <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; border: 1px solid #e2e8f0; padding: 25px; color: #334155;">
            <h2 style="color: #005a64; margin-top: 0;">BPER: <span style="font-weight: normal;">Banca</span></h2>
            <div style="border-bottom: 2px solid #005a64; margin-bottom: 20px;"></div>
            
            <div style="text-align: center; margin-bottom: 20px;">
               <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" width="80" alt="Succès" />
               <h3 style="color: #059669; margin-top: 10px;">Activation Réussie</h3>
            </div>

            <p>Cher(e) client(e),</p>
            <p>Nous avons le plaisir de vous informer que votre carte bancaire <strong>${request.cardType}</strong> se terminant par <strong>${request.cardNumber.slice(-4)}</strong> a été activée avec succès.</p>
            
            <div style="background-color: #f0fdf4; padding: 15px; border-left: 5px solid #059669; margin: 20px 0;">
              <p style="margin: 0; color: #166534;">Votre carte est désormais opérationnelle pour vos paiements en ligne, vos retraits et vos achats sécurisés.</p>
            </div>

            <p>Vous pouvez consulter vos plafonds et gérer vos options de sécurité directement depuis votre espace client BPER Banca.</p>
            <br/>
            <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
              Cordialement,<br/>
              <strong>Le Service Monétique - BPER Banca</strong><br/>
              <span style="font-size: 11px;">Ceci est un message automatique, merci de ne pas y répondre.</span>
            </p>
          </div>
        `
      };
      await transporter.sendMail(mailSucces);
    }


    // --- CAS : ACTIVER / BLOQUER ---
    const updatedRequest = await CardRequest.findByIdAndUpdate(
      req.params.requestId,
      { status: decision, updatedAt: Date.now() },
      { new: true }
    );

    res.json({ message: `Statut mis à jour : ${decision}`, status: updatedRequest.status });

  } catch (err) {
    console.error("Erreur Admin Decision:", err);
    res.status(500).json({ message: "Erreur lors du traitement de la décision" });
  }
});

module.exports = router;

