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





// 🔥 ROUTE ADMIN 1 : Récupérer toutes les demandes de prêt en attente (PENDING)
router.get("/loans/pending", auth, role("ADMIN"), async (req, res) => {
  try {
    const pendingLoans = await LoanRequest.find({ status: "PENDING" }).populate("user", "nom prenom email");
    res.json(pendingLoans);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors du chargement des demandes de prêt" });
  }
});

// 🔥 ROUTE ADMIN 2 : Décision, Génération du PDF signé et envoi par e-mail
router.post("/loan-decision/:loanId", auth, role("ADMIN"), async (req, res) => {
  try {
    const { decision, message } = req.body; 
    
    const loan = await LoanRequest.findById(req.params.loanId).populate("user");
    if (!loan) return res.status(404).json({ message: "Demande de prêt introuvable" });

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
      emailSubject = "Félicitations ! Votre contrat de financement BPER Banca est validé";

      // Corps du document juridique qui sera injecté à la fois dans le mail et figé dans le PDF joint
      const clientFullName = `${loan.firstName} ${loan.lastName.toUpperCase()}`;
      const selectedProfession = loan.profession || "Salarié / Cadre";

      // Contenu HTML structuré professionnellement pour la génération du PDF joint
      const htmlContentForPDF = `
        <html>
        <head>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; color: #111; line-height: 1.5; text-align: justify; }
            .header { border-bottom: 3px solid #004f52; padding-bottom: 10px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #004f52; }
            .title { text-align: center; text-transform: uppercase; font-size: 18px; margin: 20px 0; color: #004f52; }
            .info-block { background: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; margin-bottom: 25px; font-family: Arial, sans-serif; font-size: 13px; }
            .section-title { font-size: 14px; color: #004f52; border-bottom: 1px solid #cbd5e1; margin-top: 20px; font-weight: bold; }
            .signature-box { margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 20px; display: flex; justify-content: space-between; }
            .sig-img { border: 1px dashed #004f52; width: 200px; height: auto; display: block; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">BPER: Banca</div>
            <div style="font-size: 10px; color: #64748b;">RÉFÉRENTIEL UNIQUE CONTRACTUEL : BPER-${loan._id}</div>
          </div>
          <div class="title">OFFRE PRÉALABLE DE CRÉDIT ET EXEMPLAIRE DE CONTRAT</div>
          
          <div class="info-block">
            <strong>Organisme Prêteur :</strong> BPER Banca S.p.A.<br/>
            <strong>Bénéficiaire du Financement :</strong> M./Mme ${clientFullName}<br/>
            <strong>Activité Professionnelle Validée :</strong> ${selectedProfession}<br/>
            <strong>Montant du Capital Alloué :</strong> ${loan.amount} EUR<br/>
            <strong>Mensualités :</strong> ${loan.monthlyPayment} EUR/mois sur ${loan.duration} Mois
          </div>

          <div class="section-title">ARTICLE 1 : MISE À DISPOSITION DES FONDS</div>
          <p>Le Prêteur BPER Banca confirme par l'approbation du présent document la mise à disposition des fonds au bénéficiaire sous réserve du respect des délais de rétractation réglementaires.</p>

          <div class="section-title">ARTICLE 2 : OBLIGATION DE REMBOURSEMENT</div>
          <p>L'Emprunteur reconnaît sa dette et s'engage à honorer le paiement des mensualités constantes prélevées sur son compte bancaire courant selon l'échéancier déterminé.</p>

          <div class="section-title">ARTICLE 3 : SIGNATURE ET CERTIFICATION NUMÉRIQUE</div>
          <p>Document signé par voie électronique et certifié par l'empreinte visuelle ci-dessous.</p>

          <div class="signature-box">
            <div><strong>Fait à Paris, le ${new Date().toLocaleDateString()}</strong><br/>Pour la Direction BPER Banca</div>
            <div>
              <strong>Signature de l'Emprunteur :</strong><br/>
              <img class="sig-img" src="${loan.signatureData}" alt="Signature Client"/>
            </div>
          </div>
        </body>
        </html>
      `;

      // 1. Génération du PDF Buffer en mémoire à la volée pour la pièce jointe détachable
      let pdfBuffer;
      try {
        let options = { format: "A4" };
        let file = { content: htmlContentForPDF };
        pdfBuffer = await pdfTemplate.generatePdf(file, options);
        
        // Ajout du fichier PDF généré de manière officielle dans les pièces jointes
        emailAttachments.push({
          filename: `Contrat_BPER_Signe_${loan.lastName.toUpperCase()}.pdf`,
          content: pdfBuffer
        });
      } catch (pdfErr) {
        console.error("Erreur de compilation du PDF physique joint :", pdfErr);
        // Fallback : Si le module PDF échoue, on envoie au moins l'image intégrée
      }

      // 2. Préparation du tracé d'image embarqué dans le corps HTML de l'e-mail (CID inline)
      if (loan.signatureData && loan.signatureData.includes("base64,")) {
        const base64Data = loan.signatureData.split("base64,")[1];
        emailAttachments.push({
          filename: `signature_visual_audit.png`,
          content: Buffer.from(base64Data, "base64"),
          cid: "userSignatureImage"
        });
      }

      // Construction de la notification de bienvenue par e-mail
      emailHtml = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 30px; color: #1e293b; background-color: #ffffff;">
          <div style="text-align: left; padding-bottom: 15px; border-bottom: 3px solid #004f52;">
            <span style="font-size: 26px; font-weight: 800; color: #004f52; letter-spacing: -1px;">BPER: <span style="font-weight: 300;">Banca</span></span>
          </div>
          
          <h3 style="color: #004f52; margin-top: 25px; font-size: 18px;">Notification d'Approbation de Crédit</h3>
          <p>Cher(e) client(e) <strong>${loan.firstName} ${loan.lastName.toUpperCase()}</strong>,</p>
          <p>Le département des Engagements Financiers de la banque **BPER Banca** a le plaisir de vous confirmer la validation définitive de votre dossier de crédit.</p>
          
          <div style="background-color: #f0f7f7; padding: 15px; border-left: 4px solid #004f52; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 8px 0; color: #004f52; font-weight: bold; font-size: 14px;">Résumé des caractéristiques du crédit :</p>
            <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
              <tr><td style="padding: 4px 0; color: #475569;">Type d'offre :</td><td style="font-weight: bold; color: #002f34;">${loan.loanType}</td></tr>
              <tr><td style="padding: 4px 0; color: #475569;">Capital octroyé :</td><td style="font-weight: bold; color: #004f52;">${loan.amount?.toLocaleString()} €</td></tr>
              <tr><td style="padding: 4px 0; color: #475569;">Période :</td><td style="font-weight: bold;">${loan.duration} mois</td></tr>
              <tr><td style="padding: 4px 0; color: #475569;">Mensualité fixée :</td><td style="font-weight: bold; color: #16a34a;">${loan.monthlyPayment} € / net par mois</td></tr>
              <tr><td style="padding: 4px 0; color: #475569;">Statut professionnel :</td><td style="font-weight: bold;">${selectedProfession}</td></tr>
            </table>
          </div>

          <p style="font-size: 14px;">📎 <strong>Fichier joint sécurisé :</strong> Votre exemplaire officiel de contrat revêtu de votre signature est joint à cet e-mail au format **PDF imprimable** pour vos archives.</p>
          
          <div style="margin-top: 25px; text-align: center; background: #fafafa; padding: 15px; border: 1px dashed #cbd5e1;">
            <span style="font-size: 12px; color: #64748b; display: block; margin-bottom: 5px;">Aperçu de votre signature électronique cryptée :</span>
            <img src="cid:userSignatureImage" alt="Empreinte Signature" style="max-width: 160px; height: auto;" />
          </div>

          <p style="font-size: 12px; color: #64748b; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 15px;">
            Cet e-mail est généré automatiquement par nos systèmes bancaires cryptés. BPER Banca S.p.A. au capital social de 2 100 435 182,40 €.
          </p>
        </div>
      `;

    } else if (decision === "REJECTED") {
      loan.status = "REJECTED";
      emailSubject = "Mise à jour concernant votre demande d'octroi de crédit - BPER Banca";
      emailHtml = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 30px; color: #1e293b;">
          <div style="text-align: left; padding-bottom: 15px; border-bottom: 3px solid #dc2626;">
            <span style="font-size: 26px; font-weight: 800; color: #dc2626;">BPER: <span style="font-weight: 300; color: #64748b;">Banca</span></span>
          </div>
          <p style="margin-top: 20px;">Cher(e) client(e),</p>
          <p>Nous avons effectué l'analyse technique de vos données pour votre demande de <strong>${loan.loanType}</strong> d'un montant de ${loan.amount} €.</p>
          <p>Après étude minutieuse de vos pièces ainsi que des critères d'attribution réglementaires en vigueur, nous avons le regret de vous informer que nous ne pouvons donner de suite favorable à cette demande pour la raison suivante :</p>
          
          <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0; font-style: italic; color: #991b1b; font-size: 14px;">
            "${message || "Critères de solvabilité insuffisants au regard des réglementations bancaires actuelles."}"
          </div>
          
          <p>Votre dossier de demande en ligne est clôturé. Nos conseillers restent à votre disposition pour toute restructuration future de votre projet.</p>
          <br/>
          <p style="font-size: 13px; color: #64748b;">Cordialement,<br/><strong>Le Service d'Arbitrage des Crédits Particuliers — BPER Banca</strong></p>
        </div>
      `;
    }

    // Sauvegarde en base de données Atlas
    await loan.save();

    // Envoi effectif via le serveur SMTP sécurisé
    await transporter.sendMail({
      from: `"BPER Banca - Service Crédits" <${process.env.MAIL_USER}>`,
      to: loan.user.email,
      subject: emailSubject,
      html: emailHtml,
      attachments: emailAttachments
    });

    res.json({ message: `Le dossier a été statué avec succès (${decision}). Le client a reçu son récapitulatif officiel et son PDF joint.` });

  } catch (err) {
    console.error("Erreur Décision Prêt:", err);
    res.status(500).json({ message: "Erreur lors du traitement de la demande de prêt bancaire" });
  }
});

module.exports = router;