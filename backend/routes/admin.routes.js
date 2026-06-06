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
const pdfTemplate = require("html-pdf-node");
const LoanRequest = require("../models/LoanRequest");

const BPER_STAMP = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="%23004f52" stroke-width="2"/><circle cx="50" cy="50" r="38" fill="none" stroke="%23004f52" stroke-width="1"/><text x="50" y="35" font-family="Arial" font-size="6" font-weight="bold" fill="%23004f52" text-anchor="middle">BPER: BANCA S.p.A.</text><text x="50" y="52" font-family="Arial" font-size="5" font-weight="bold" fill="%23004f52" text-anchor="middle">DIRECTION DES ENGAGEMENTS</text><text x="50" y="68" font-family="Arial" font-size="6" font-weight="bold" fill="%23004f52" text-anchor="middle">CONTRAT ACCORDÉ</text></svg>`;
const BPER_DIRECTOR_SIGNATURE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="60" viewBox="0 0 150 60"><path d="M10,40 Q30,10 50,35 T90,20 T130,45" fill="none" stroke="%231e3a8a" stroke-width="2.5"/></svg>`;

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
    
      const transporter = nodemailer.createTransport({
        host: "smtp.zoho.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.MAIL_USER, // contact@tirageroyale.com
          pass: process.env.MAIL_PASS  // mot de passe application Zoho
        }
      });

      if (decision === "delete") {
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

    // --- CAS : ACTIVER ---
    if (decision === "active") {
      const mailSucces = {
        from: `"BPER Banca - Service Cartes" <${process.env.MAIL_USER}>`,
        to: request.user.email,
        subject: "Félicitations ! Votre carte BPER est activée",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; border: 1px solid #e2e8f0; padding: 25px; color: #334155;">
            <h2 style="color: #005a64; margin-top: 0;">BPER: <span style="font-weight: normal;">Banca</span></h2>
            <div style="border-bottom: 2px solid #005a64; margin-bottom: 20px;"></div>
            
            <div style="text-align: center; margin-bottom: 25px;">
               <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" width="70" alt="Succès" />
               <h3 style="color: #059669; margin-top: 15px; font-size: 22px;">Activation Réussie</h3>
            </div>

            <p>Cher(e) client(e),</p>
            <p>Nous avons le plaisir de vous confirmer que votre carte bancaire <strong>${request.cardType}</strong> est désormais <strong>active et prête à l'emploi</strong>.</p>
            
            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border: 1px solid #bbf7d0; margin: 20px 0; text-align: center;">
              <p style="margin: 0; color: #166534; font-weight: bold;">
                N° de carte : **** **** **** ${request.cardNumber.slice(-4)}
              </p>
            </div>

            <p>Vous pouvez dès à présent effectuer vos opérations en ligne et en magasin en toute sécurité.</p>
            <br/>
            <p style="font-size: 13px; color: #64748b; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 15px;">
              Cordialement,<br/>
              <strong>Direction des Services Monétiques</strong><br/>
              BPER Banca
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





// Images de sécurité intégrées au PDF (Cachet et Signature Direction)


// 🛑 VOS ROUTES D'ORIGINE (Préservées pour éviter le bug 404)

// 1. Récupération des prêts
router.get("/loans/pending", auth, role("ADMIN"), async (req, res) => {
  try {
    const pendingLoans = await LoanRequest.find({ status: "PENDING" }).populate("user");
    res.json(pendingLoans);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur lors de la récupération" });
  }
});

// 2. Traitement de la décision et envoi de l'offre de Produits.jsx en PDF joint
router.post("/loan-decision/:loanId", auth, role("ADMIN"), async (req, res) => {
  try {
    const { decision, message } = req.body;
    const loan = await LoanRequest.findById(req.params.loanId).populate("user");
    
    if (!loan) return res.status(404).json({ message: "Dossier introuvable" });

    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    let emailSubject = "";
    let emailHtml = "";
    let emailAttachments = [];

    if (decision === "APPROVED") {
      loan.status = "APPROVED";
      emailSubject = "Votre contrat de crédit signé et approuvé — BPER Banca";

      const clientFullName = `${loan.firstName} ${loan.lastName?.toUpperCase()}`;
      const currentDate = new Date().toLocaleDateString("fr-FR");

      // 🛑 INJECTION DIRECTE DE VOTRE COMPOSANT MODALE AVEC SES STYLES D'ORIGINE
      const htmlExactContractModal = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              margin: 0; padding: 0; background-color: #f1f5f9; 
              font-family: 'Times New Roman', Times, serif; box-sizing: border-box; 
            }
            .modal-header { 
              background: #004f52; padding: 15px 20px; display: flex; 
              align-items: center; justify-content: space-between; color: #fff; 
            }
            .contract-wrapper { 
              padding: 30px 40px; display: flex; flex-direction: column; align-items: center; 
            }
            .contract-white-box { 
              background-color: #fff; width: 100%; max-width: 800px; padding: 50px; 
              box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-radius: 4px; color: #000; 
              font-size: 0.95rem; line-height: 1.6; text-align: justify; 
            }
            .title-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #004f52; padding-bottom: 15px; }
            .profession-box { background: #f8fafc; padding: 12px; border-radius: 6px; margin-bottom: 25px; border: 1px solid #cbd5e1; font-family: sans-serif; font-size: 0.85rem; }
            h3 { color: #004f52; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; font-size: 1.05rem; margin-top: 20px; font-weight: bold; }
            .mention-line { margin-top: 40px; border-top: 1px solid #000; padding-top: 10px; display: flex; justify-content: space-between; font-size: 0.8rem; font-style: italic; }
            
            /* Alignement géométrique des signatures requis */
            .signatures-block { margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-start; page-break-inside: avoid; }
            .sig-col-left { width: 45%; text-align: left; font-family: sans-serif; font-size: 0.8rem; }
            .sig-col-right { width: 45%; text-align: right; font-family: sans-serif; font-size: 0.8rem; position: relative; }
            .img-sig-client { width: 100%; max-width: 180px; height: 75px; object-fit: contain; border: 1px dashed #cbd5e1; margin-top: 5px; background: #fafafa; }
            .img-sig-director { max-width: 140px; height: 50px; object-fit: contain; margin-top: 5px; }
            .img-stamp { width: 80px; height: 80px; position: absolute; right: 100px; top: 5px; opacity: 0.85; }
          </style>
        </head>
        <body>
          <div class="modal-header">
            <span style="font-size: 1.4rem; font-weight: bold; letter-spacing: 1px;">BPER: Banca</span>
            <span style="font-size: 0.75rem; opacity: 0.8; font-family: sans-serif;">RÉF: BPER-CONTRACT-${loan._id}</span>
          </div>
          <div class="contract-wrapper">
            <div class="contract-white-box">
              <div class="title-header">
                <h1 style="font-size: 1.5rem; color: #004f52; margin: 0 0 5px 0; text-transform: uppercase;">Offre Préalable de Crédit</h1>
                <p style="margin: 0; font-style: italic; color: #475569; font-size: 0.8rem; font-family: sans-serif;">Contrat régi conformément aux directives bancaires européennes</p>
              </div>
              <div class="profession-box">
                <p><strong>Organisme Prêteur :</strong> BPER Banca S.p.A. </p>
                <p><strong>Bénéficiaire :</strong> ${loan.civility} ${loan.lastName?.toUpperCase()} ${loan.firstName}</p>
                <p><strong>Profession du client :</strong> <span style="color: #004f52; font-weight: bold;">${loan.profession}</span></p>
                <p><strong>Revenus Mensuels :</strong> ${loan.income} EUR</p>
              </div>
              <h3>ARTICLE 1 : OBJET ET ASSIETTE DU FINANCEMENT</h3>
              <p>Le présent engagement stipule que la <strong>BPER Banca</strong> consent au client mentionné ci-dessus, qui l'accepte formellement, un crédit d'un montant en capital de <strong>${loan.amount} EUR</strong> au titre de l'offre <em>"${loan.loanType}"</em>.</p>
              <h3>ARTICLE 2 : CONDITIONS DE REMBOURSEMENT ET AMORTISSEMENT</h3>
              <p>L'emprunteur s'engage irrévocablement à rembourser l'intégralité du capital emprunté majoré des intérêts courus sur une durée ferme de <strong>${loan.duration} mois</strong>. Le prélèvement s'exécutera à échéance constante fixe d'un montant brut de <strong>${loan.monthlyPayment} EUR par mois</strong>. Le Taux Annuel Effectif Global (TAEG) appliqué est contractuellement fixé à 4,90%.</p>
              <h3>ARTICLE 3 : EXIGIBILITÉ ET DÉCHÉANCE DU TERME</h3>
              <p>Toute fausse déclaration concernant les justificatifs financiers ou tout défaut récurrent de paiement des mensualités dues entraînera de plein droit l'exigibilité immédiate des sommes restant dues.</p>
              <h3>ARTICLE 4 : DROIT DE RÉTRACTATION</h3>
              <p>Conformément à la législation sur le crédit, l'emprunteur dispose d'un délai légal de rétractation de 14 jours calendaires révolus à compter de la date de signature de la présente offre en ligne.</p>
              <h3>ARTICLE 5 : CONSENTEMENT ET PREUVE ÉLECTRONIQUE</h3>
              <p>Les parties s'entendent expressément pour conférer au procédé technique de signature électronique utilisé sur la présente plateforme internet la même valeur juridique qu'une signature manuscrite sur support papier.</p>
              <div class="mention-line">
                <span>Mention : "Bon pour acceptation de l'offre de crédit"</span>
                <span>Émis par BPER Banca S.p.A.</span>
              </div>
              
              <div class="signatures-block">
                <div class="sig-col-left">
                  <strong style="color: #004f52;">L'Emprunteur (Signataire) :</strong><br/>
                  <span>Nom & Prénom : ${clientFullName}</span><br/>
                  <span>Fait le : ${currentDate}</span>
                  <img class="img-sig-client" src="${loan.signatureData}" alt="Signature Client"/>
                </div>
                <div class="sig-col-right">
                  <strong style="color: #004f52;">Pour la banque BPER Banca :</strong><br/>
                  <span>Le Directeur Général des Engagements</span><br/>
                  <span>Validé le : ${currentDate}</span><br/>
                  <img class="img-stamp" src="${BPER_STAMP}" alt="Cachet"/>
                  <img class="img-sig-director" src="${BPER_DIRECTOR_SIGNATURE}" alt="Signature Directeur"/>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      // Compilation sécurisée du HTML en fichier PDF
      try {
        const options = { format: "A4", margin: { top: "15mm", bottom: "15mm", left: "15mm", right: "15mm" } };
        const file = { content: htmlExactContractModal };
        const pdfBuffer = await pdfTemplate.generatePdf(file, options);
        
        emailAttachments.push({
          filename: `Contrat_BPER_Signe_${loan.lastName?.toUpperCase()}.pdf`,
          content: pdfBuffer
        });
      } catch (pdfErr) {
        console.error("Erreur de conversion PDF :", pdfErr);
      }

      emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #cbd5e1; padding: 25px;">
          <h2 style="color: #004f52; border-bottom: 2px solid #004f52; padding-bottom: 10px;">BPER: Banca</h2>
          <p>Bonjour <strong>${loan.firstName} ${loan.lastName?.toUpperCase()}</strong>,</p>
          <p>Votre dossier de crédit a été approuvé. Votre exemplaire officiel de votre <strong>Offre Préalable de Crédit est joint à cet e-mail au format PDF</strong>.</p>
          <p>Ce document certifié intègre votre signature électronique ainsi que celle de notre direction avec le cachet officiel de notre établissement.</p>
          <p>Cordialement,<br/>Le Service des Crédits BPER Banca</p>
        </div>
      `;
    } else {
      loan.status = "REJECTED";
      emailSubject = "Mise à jour de votre dossier — BPER Banca";
      emailHtml = `<p>Bonjour, votre demande a été refusée pour le motif suivant : ${message}</p>`;
    }

    await loan.save();
    
    if (emailSubject !== "") {
      await transporter.sendMail({
        from: `"BPER Banca" <${process.env.MAIL_USER}>`,
        to: loan.user.email,
        subject: emailSubject,
        html: emailHtml,
        attachments: emailAttachments
      });
    }

    res.json({ message: "Statut mis à jour et e-mail envoyé avec le PDF d'origine signé." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors du traitement de la décision." });
  }
});

module.exports = router;