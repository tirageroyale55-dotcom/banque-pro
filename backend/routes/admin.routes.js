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





const BPER_STAMP = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="%23004f52" stroke-width="2"/><circle cx="50" cy="50" r="38" fill="none" stroke="%23004f52" stroke-width="1"/><text x="50" y="35" font-family="Arial" font-size="6" font-weight="bold" fill="%23004f52" text-anchor="middle">BPER: BANCA S.p.A.</text><text x="50" y="52" font-family="Arial" font-size="5" font-weight="bold" fill="%23004f52" text-anchor="middle">DIRECTION DES ENGAGEMENTS</text><text x="50" y="68" font-family="Arial" font-size="6" font-weight="bold" fill="%23004f52" text-anchor="middle">CONTRAT ACCORDÉ</text></svg>`;
const BPER_DIRECTOR_SIGNATURE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="60" viewBox="0 0 150 60"><path d="M10,40 Q30,10 50,35 T90,20 T130,45" fill="none" stroke="%231e3a8a" stroke-width="2.5"/></svg>`;

router.post("/loan-decision/:loanId", auth, role("ADMIN"), async (req, res) => {
  try {
    const { decision, message } = req.body;
    
    const loan = await LoanRequest.findById(req.params.loanId).populate("user");
    if (!loan) return res.status(404).json({ message: "Demande introuvable" });

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
      emailSubject = "⚠️ CONTRAT DE CRÉDIT SIGNÉ - Exemplaire Officiel PDF - BPER Banca";

      const clientFullName = `${loan.firstName} ${loan.lastName.toUpperCase()}`;
      const currentDate = new Date().toLocaleDateString("fr-FR");

      // 🛑 ICI : REPRODUCTION EXACTE ET STRICTE DE VOTRE MODALE DE PRODUITS.JSX POUR LE PDF
      const htmlExactContractModal = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Contrat de Crédit BPER Banca</title>
          <style>
            body { 
              margin: 0; 
              padding: 30px; 
              background-color: #f1f5f9; 
              font-family: 'Times New Roman', Times, serif; 
              color: #000;
              -webkit-print-color-adjust: exact;
            }
            .modal-header { 
              background-color: #004f52; 
              padding: 15px 20px; 
              display: flex; 
              align-items: center; 
              justify-content: space-between; 
              color: #fff; 
            }
            .modal-header span.logo { font-size: 1.4rem; font-weight: bold; letter-spacing: 1px; }
            .modal-header span.ref { font-size: 0.75rem; opacity: 0.8; font-family: sans-serif; }
            
            .contract-container {
              background-color: #fff; 
              width: 100%; 
              max-width: 800px; 
              margin: 20px auto;
              padding: 50px; 
              box-shadow: 0 4px 15px rgba(0,0,0,0.1); 
              border-radius: 4px; 
              font-size: 0.95rem; 
              line-height: 1.6; 
              text-align: justify;
              box-sizing: border-box;
            }
            .title-section { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #004f52; padding-bottom: 15px; }
            .title-section h1 { fontSize: 1.5rem; color: #004f52; margin: 0 0 5px 0; text-transform: uppercase; }
            .title-section p { margin: 0; font-style: italic; color: #475569; font-size: 0.8rem; font-family: sans-serif; }
            
            .profession-box { background: #f8fafc; padding: 12px; borderRadius: 6px; margin-bottom: 25px; border: 1px solid #cbd5e1; font-family: sans-serif; fontSize: 0.85rem; }
            .profession-box p { margin: 3px 0; }
            
            h3 { color: #004f52; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; font-size: 1.05rem; margin-top: 20px; font-weight: bold; }
            p { margin-bottom: 15px; }
            
            .mention-footer { margin-top: 40px; border-top: 1px solid #000; paddingTop: 10px; display: flex; justify-content: space-between; font-size: 0.8rem; font-style: italic; }
            
            /* 🛑 INCRUSTATION DES SIGNATURES EXACTES */
            .signatures-row { 
              margin-top: 50px; 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-start;
              page-break-inside: avoid;
            }
            .box-signature-client { width: 45%; text-align: left; font-family: sans-serif; font-size: 0.85rem; }
            .box-signature-bank { width: 45%; text-align: right; font-family: sans-serif; font-size: 0.85rem; position: relative; }
            .img-signature-client { width: 100%; max-width: 200px; height: 80px; object-fit: contain; border: 1px dashed #004f52; margin-top: 8px; background: #fafafa; display: block; }
            .img-signature-director { max-width: 150px; height: 50px; object-fit: contain; margin-top: 8px; display: inline-block; }
            .img-stamp-bper { width: 85px; height: 85px; position: absolute; right: 90px; top: 10px; opacity: 0.9; }
          </style>
        </head>
        <body>

          <!-- Reproduction exacte de la barre de l'en-tête de votre modale -->
          <div class="modal-header">
            <span class="logo">BPER: Banca</span>
            <span class="ref">RÉF: BPER-CONTRACT-${loan._id}</span>
          </div>

          <!-- Fond Blanc Immortel de votre document -->
          <div class="contract-container">
            <div class="title-section">
              <h1>Offre Préalable de Crédit</h1>
              <p>Contrat régi conformément aux directives bancaires européennes</p>
            </div>

            <div class="profession-box">
              <p><strong>Organisme Prêteur :</strong> BPER Banca S.p.A. </p>
              <p><strong>Bénéficiaire :</strong> ${loan.civility} ${loan.lastName.toUpperCase()} ${loan.firstName}</p>
              <p><strong>Profession du client :</strong> <span style="color: #004f52; font-weight: bold;">${loan.profession || "Non spécifiée"}</span></p>
              <p><strong>Revenus Mensuels :</strong> ${loan.income?.toLocaleString()} EUR</p>
            </div>

            <h3>ARTICLE 1 : OBJET ET ASSIETTE DU FINANCEMENT</h3>
            <p>Le présent engagement stipule que la <strong>BPER Banca</strong> consent au client mentionné ci-dessus, qui l'accepte formellement, un crédit d'un montant en capital de <strong>${loan.amount?.toLocaleString()} EUR</strong> au titre de l'offre <em>"${loan.loanType}"</em>. Ce capital est exclusivement mis à disposition pour la réalisation du projet déclaré ou l'ajustement de trésorerie souscrit.</p>

            <h3>ARTICLE 2 : CONDITIONS DE REMBOURSEMENT ET AMORTISSEMENT</h3>
            <p>L'emprunteur s'engage irrévocablement à rembourser l'intégralité du capital emprunté majoré des intérêts courus sur une durée ferme de <strong>${loan.duration} mois</strong>. Le prélèvement s'exécutera à échéance constante fixe d'un montant brut de <strong>${loan.monthlyPayment?.toLocaleString()} EUR par mois</strong>. Le Taux Annuel Effectif Global (TAEG) appliqué est contractuellement fixé à 4,90%.</p>

            <h3>ARTICLE 3 : EXIGIBILITÉ ET DÉCHÉANCE DU TERME</h3>
            <p>Toute fausse déclaration concernant les justificatifs financiers ou tout défaut récurrent de paiement des mensualités dues entraînera de plein droit l'exigibilité immédiate des sommes restant dues. La banque BPER Banca se réservera le droit d'appliquer une indemnité forfaitaire égale à 8% du capital restant dû.</p>

            <h3>ARTICLE 4 : DROIT DE RÉTRACTATION</h3>
            <p>Conformément à la législation sur le crédit, l'emprunteur dispose d'un délai légal de rétractation de 14 jours calendaires révolus à compter de la date de signature de la présente offre en ligne pour renoncer à son engagement par lettre recommandée avec accusé de réception.</p>

            <h3>ARTICLE 5 : CONSENTEMENT ET PREUVE ÉLECTRONIQUE</h3>
            <p>Les parties s'entendent expressément pour conférer au procédé technique de signature électronique utilisé sur la présente plateforme internet la même valeur juridique qu'une signature manuscrite sur support papier. Le clic sur le bouton de clôture vaut validation intégrale de l'ensemble des clauses précitées.</p>

            <div class="mention-footer">
              <span>Mention : "Bon pour acceptation de l'offre de crédit"</span>
              <span>Émis par BPER Banca S.p.A.</span>
            </div>

            <!-- placement automatique des signatures exigées en bas du document -->
            <div class="signatures-row">
              <div class="box-signature-client">
                <strong style="color: #004f52;">L'Emprunteur (Signataire) :</strong><br/>
                <span style="font-size: 12px; color: #475569;">${clientFullName}</span><br/>
                <span style="font-size: 11px; color: #64748b;">Signé électroniquement le ${currentDate}</span>
                <!-- Rendu de la signature du client enregistrée lors du parcours de Produits.jsx -->
                <img class="img-signature-client" src="${loan.signatureData}" alt="Signature Client"/>
              </div>

              <div class="box-signature-bank">
                <strong style="color: #004f52;">Pour BPER Banca :</strong><br/>
                <span style="font-size: 12px; color: #475569;">Le Directeur des Engagements</span><br/>
                <span style="font-size: 11px; color: #64748b;">Validé le ${currentDate}</span><br/>
                <!-- Cachet officiel + Signature du Directeur à droite -->
                <img class="img-stamp-bper" src="${BPER_STAMP}" alt="Cachet BPER"/>
                <img class="img-signature-director" src="${BPER_DIRECTOR_SIGNATURE}" alt="Signature Direction"/>
              </div>
            </div>

          </div>
        </body>
        </html>
      `;

      // Compilation instantanée du HTML identique en flux PDF binaire A4
      try {
        const options = { format: "A4", margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" } };
        const file = { content: htmlExactContractModal };
        const pdfBuffer = await pdfTemplate.generatePdf(file, options);
        
        // Attachement du fichier PDF officiel dans les pièces jointes réelles de l'email
        emailAttachments.push({
          filename: `Contrat_Pret_BPER_${loan.lastName.toUpperCase()}.pdf`,
          content: pdfBuffer
        });
      } catch (errPdf) {
        console.error("Erreur génération PDF :", errPdf);
      }

      // Structure de l'e-mail de notification reçu par le client
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #cbd5e1; background-color: #fff;">
          <div style="background-color: #004f52; padding: 15px; color: white; font-size: 20px; font-weight: bold;">
            BPER: Banca — Service des Engagements
          </div>
          <p style="margin-top:20px;">Félicitations <strong>${loan.firstName} ${loan.lastName.toUpperCase()}</strong>,</p>
          <p>Votre demande de financement a été officiellement approuvée par l'administration générale de la banque BPER Banca.</p>
          <p>👉 <strong>Votre document contractuel signé est prêt :</strong> Vous trouverez ci-joint votre exemplaire complet de l'<strong>Offre Préalable de Crédit en version PDF</strong>. Ce document comprend votre signature électronique enregistrée en bas à gauche, ainsi que le cachet officiel d'approbation de notre établissement à droite.</p>
          <p><em>Veuillez ouvrir la pièce jointe PDF pour consulter, imprimer ou télécharger votre contrat certifié conforme.</em></p>
          <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 20px 0;"/>
          <p style="font-size: 11px; color: #64748b; text-align: center;">Ce message est automatisé. BPER Banca S.p.A. au capital de 2 100 435 182,40 €.</p>
        </div>
      `;
    } else {
      loan.status = "REJECTED";
      emailSubject = "Notification d'analyse de dossier — BPER Banca";
      emailHtml = `<p>Bonjour, suite à l'analyse de votre dossier, nous ne pouvons pas valider votre demande pour le motif suivant : ${message}</p>`;
    }

    await loan.save();

    await transporter.sendMail({
      from: `"BPER Banca — Crédits" <${process.env.MAIL_USER}>`,
      to: loan.user.email,
      subject: emailSubject,
      html: emailHtml,
      attachments: emailAttachments
    });

    res.json({ message: "Le dossier a été approuvé. L'utilisateur a reçu l'exacte copie conforme de sa modale contrat au format PDF joint." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur interne lors du traitement." });
  }
});

module.exports = router;