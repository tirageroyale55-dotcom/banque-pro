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
const PDFDocument = require("pdfkit"); 
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






// =========================================================================
// 1. RÉCUPÉRATION DES DOSSIERS EN ATTENTE
// =========================================================================
router.get("/loans/pending", auth, role("ADMIN"), async (req, res) => {
  try {
    const pendingLoans = await LoanRequest.find({ status: "PENDING" }).populate("user");
    res.json(pendingLoans);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur lors de la récupération" });
  }
});

// =========================================================================
// 2. DÉCISION DE L'ADMINISTRATEUR & GÉNÉRATION/ENVOI DU PDF OFFICIEL
// =========================================================================
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
      emailSubject = "⚠️ CONTRAT DE CRÉDIT SIGNÉ - Exemplaire PDF - BPER Banca";

      const clientFullName = `${loan.firstName} ${loan.lastName?.toUpperCase()}`;
      const currentDate = new Date().toLocaleDateString("fr-FR");

      // GÉNÉRATION DU PDF COMPATIBLE VERCEL (MÉMOIRE BUFFER)
      const pdfBuffer = await new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 40, size: "A4" });
        let buffers = [];
        
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", (err) => reject(err));

        // En-tête du contrat
        doc.rect(0, 0, 600, 60).fill("#004f52");
        doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(20).text("BPER: Banca", 40, 22);
        doc.fontSize(9).font("Helvetica").text(`RÉF: BPER-CONTRACT-${loan._id}`, 420, 26);

        // Titre Principal
        doc.moveDown(4);
        doc.fillColor("#004f52").font("Times-Bold").fontSize(22).text("Offre Préalable de Crédit", { align: "center" });
        doc.fillColor("#475569").font("Times-Italic").fontSize(10).text("Contrat régi conformément aux directives bancaires européennes", { align: "center" });
        
        // Fiche d'identité Client
        doc.moveDown(2);
        doc.rect(40, doc.y, 515, 75).fill("#f8fafc").stroke("#cbd5e1");
        doc.fillColor("#000000").font("Helvetica").fontSize(10);
        doc.text(`Organisme Prêteur : BPER Banca S.p.A.`, 50, doc.y - 65);
        doc.text(`Bénéficiaire : ${loan.civility} ${clientFullName}`, 50, doc.y + 2);
        doc.font("Helvetica-Bold").text(`Profession du client : `, 50, doc.y + 2);
        doc.fillColor("#004f52").text(`${loan.profession || "Salarié"}`, 155, doc.y - 12);
        doc.fillColor("#000000").font("Helvetica").text(`Revenus Mensuels : ${loan.income?.toLocaleString()} EUR`, 50, doc.y + 12);

        // Les 5 Articles Légaux de votre Modale
        doc.moveDown(3);
        doc.fillColor("#004f52").font("Times-Bold").fontSize(12).text("ARTICLE 1 : OBJET ET ASSIETTE DU FINANCEMENT");
        doc.fillColor("#000000").font("Times-Roman").fontSize(10).text(`Le présent engagement stipule que la BPER Banca consent au client mentionné ci-dessus, qui l'accepte formellement, un crédit d'un montant en capital de ${loan.amount?.toLocaleString()} EUR au titre de l'offre "${loan.loanType}". Ce capital est exclusivement mis à disposition pour la réalisation du projet déclaré ou l'ajustement de trésorerie souscrit.`, { align: "justify" });

        doc.moveDown(1.5);
        doc.fillColor("#004f52").font("Times-Bold").fontSize(12).text("ARTICLE 2 : CONDITIONS DE REMBOURSEMENT ET AMORTISSEMENT");
        doc.fillColor("#000000").font("Times-Roman").fontSize(10).text(`L'emprunteur s'engage irrévocablement à rembourser l'intégralité du capital emprunté majoré des intérêts courus sur une durée ferme de ${loan.duration} mois. Le prélèvement s'exécutera à échéance constante fixe d'un montant brut de ${loan.monthlyPayment?.toLocaleString()} EUR par mois. Le Taux Annuel Effectif Global (TAEG) appliqué est contractuellement fixé à 4,90%.`, { align: "justify" });

        doc.moveDown(1.5);
        doc.fillColor("#004f52").font("Times-Bold").fontSize(12).text("ARTICLE 3 : EXIGIBILITÉ ET DÉCHÉANCE DU TERME");
        doc.fillColor("#000000").font("Times-Roman").fontSize(10).text("Toute fausse déclaration concernant les justificatifs financiers ou tout défaut récurrent de paiement des mensualités dues entraînera de plein droit l'exigibilité immédiate des sommes restant dues. La banque BPER Banca se réservera le droit d'appliquer une indemnité forfaitaire égale à 8% du capital restant dû.", { align: "justify" });

        doc.moveDown(1.5);
        doc.fillColor("#004f52").font("Times-Bold").fontSize(12).text("ARTICLE 4 : DROIT DE RÉTRACTATION");
        doc.fillColor("#000000").font("Times-Roman").fontSize(10).text("Conformément à la législation sur le crédit, l'emprunteur dispose d'un délai légal de rétractation de 14 jours calendaires révolus à compter de la date de signature de la présente offre en ligne pour renoncer à son engagement par lettre recommandée avec accusé de réception.", { align: "justify" });

        doc.moveDown(1.5);
        doc.fillColor("#004f52").font("Times-Bold").fontSize(12).text("ARTICLE 5 : CONSENTEMENT ET PREUVE ÉLECTRONIQUE");
        doc.fillColor("#000000").font("Times-Roman").fontSize(10).text("Les parties s'entendent expressément pour conférer au procédé technique de signature électronique utilisé sur la présente plateforme internet la même valeur juridique qu'une signature manuscrite sur support papier. Le clic sur le bouton de clôture vaut validation intégrale de l'ensemble des clauses précitées.", { align: "justify" });

        // Mentions bas de page
        doc.moveDown(2);
        doc.font("Times-Italic").fontSize(9).text("Mention : \"Bon pour acceptation de l'offre de crédit\"", 40, doc.y);
        doc.text("Émis par BPER Banca S.p.A.", 420, doc.y);

        // SECTION ALIGNEMENT SIGNATURES
        doc.moveDown(3);
        const ySignatureZone = doc.y;

        // 👈 À GAUCHE : Signature de l'utilisateur
        doc.fillColor("#004f52").font("Helvetica-Bold").fontSize(10).text("L'Emprunteur (Signataire) :", 40, ySignatureZone);
        doc.fillColor("#000000").font("Helvetica").fontSize(9).text(`Nom : ${clientFullName}`, 40, ySignatureZone + 15);
        doc.text(`Fait en ligne le : ${currentDate}`, 40, ySignatureZone + 28);
        
        if (loan.signatureData && loan.signatureData.includes("base64,")) {
          try {
            const clientSigBuffer = Buffer.from(loan.signatureData.split("base64,")[1], "base64");
            doc.image(clientSigBuffer, 40, ySignatureZone + 42, { width: 140, height: 55 });
            doc.rect(40, ySignatureZone + 42, 140, 55).lineWidth(1).dash(4, { space: 2 }).stroke("#cbd5e1");
          } catch (e) {
            doc.text("[Signature Électronique Certifiée]", 40, ySignatureZone + 45);
          }
        } else {
          doc.fillColor("#64748b").font("Helvetica-Oblique").text("[Signature Enregistrée Électroniquement]", 40, ySignatureZone + 45);
        }

        // 👉 À DROITE : Tampon BPER + Réplication Exacte de votre Image (Stylo Bic Bleu)
        doc.fillColor("#004f52").font("Helvetica-Bold").fontSize(10).text("Pour la banque BPER Banca :", 360, ySignatureZone);
        doc.fillColor("#000000").font("Helvetica").fontSize(9).text("Le Directeur Général des Engagements", 360, ySignatureZone + 15);
        doc.text(`Approuvé le : ${currentDate}`, 360, ySignatureZone + 28);
        
        const centerX = 390;
        const centerY = ySignatureZone + 75;
        
        // Tracé du cachet vert de la banque en arrière-plan
        doc.circle(centerX, centerY, 30).lineWidth(1.2).stroke("#004f52");
        doc.circle(centerX, centerY, 25).lineWidth(0.5).stroke("#004f52");
        doc.fillColor("#004f52").font("Helvetica-Bold").fontSize(4.5);
        doc.text("BPER: BANCA S.p.A.", centerX - 20, centerY - 14, { width: 40, align: "center" });
        doc.font("Helvetica").fontSize(3.5);
        doc.text("DIRECTION DES", centerX - 20, centerY - 2, { width: 40, align: "center" });
        doc.text("ENGAGEMENTS", centerX - 20, centerY + 3, { width: 40, align: "center" });
        doc.font("Helvetica-Bold").fontSize(4.5);
        doc.text("ACCORDÉ", centerX - 20, centerY + 11, { width: 40, align: "center" });

        // 🖋️ REPRODUCTION DE VOTRE CAPTURE (Stylo Bic Bleu)
        // Configuration de la ligne (Style Stylo à bille fluide)
        doc.strokeColor("#1d4ed8").lineWidth(1.4).linejoin("round").linecap("round");

        const startX = 350;
        const baseSignY = centerY + 5;

        // 1. La grande boucle ovale de gauche
        doc.moveTo(startX + 40, baseSignY - 8)
           .bezierCurveTo(startX + 5, baseSignY - 20, startX, baseSignY + 12, startX + 35, baseSignY + 10)
           .bezierCurveTo(startX + 75, baseSignY + 8, startX + 85, baseSignY - 15, startX + 85, baseSignY - 25);

        // 2. Le premier grand trait vertical qui descend très bas (Barre gauche du H)
        doc.lineTo(startX + 85, baseSignY + 30);

        // 3. Remontée pour l'effet d'écriture "H / d" entremêlé
        doc.moveTo(startX + 85, baseSignY - 5)
           .bezierCurveTo(startX + 92, baseSignY - 20, startX + 98, baseSignY - 10, startX + 100, baseSignY + 5);

        // 4. Le deuxième grand trait vertical qui traverse (Barre droite du H)
        doc.moveTo(startX + 106, baseSignY - 28)
           .lineTo(startX + 106, baseSignY + 15);

        // 5. Les vagues centrales d'écriture fluides ("un/ar")
        doc.moveTo(startX + 106, baseSignY + 2)
           .bezierCurveTo(startX + 112, baseSignY - 12, startX + 116, baseSignY - 2, startX + 120, baseSignY + 5) // premier pont
           .bezierCurveTo(startX + 124, baseSignY - 8, startX + 128, baseSignY - 4, startX + 132, baseSignY + 4)  // deuxième pont
           .bezierCurveTo(startX + 138, baseSignY - 10, startX + 144, baseSignY - 8, startX + 148, baseSignY)     // transition vers la fin
           .bezierCurveTo(startX + 155, baseSignY + 6, startX + 165, baseSignY - 2, startX + 185, baseSignY - 4); // étirement de fin

        // 6. La longue ligne droite d'accentuation horizontale du milieu qui part vers la droite
        doc.moveTo(startX + 130, baseSignY - 2)
           .lineTo(startX + 235, baseSignY - 1);

        // 7. Le point isolé en haut à droite
        doc.circle(startX + 172, baseSignY - 16, 0.7).fill("#1d4ed8");

        // 8. Le grand trait de soulignement inférieur bien droit tout en bas
        doc.moveTo(startX + 30, baseSignY + 18)
           .lineTo(startX + 205, baseSignY + 16)
           .stroke(); // Applique le tracé final de l'encre

        doc.end();
      });

      // Jointure du PDF à l'e-mail
      emailAttachments.push({
        filename: `Contrat_BPER_Signe_${loan.lastName?.toUpperCase()}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf"
      });

      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #cbd5e1; padding: 25px; background: #fff;">
          <h2 style="color: #004f52; border-bottom: 2px solid #004f52; padding-bottom: 10px; margin-top: 0;">BPER: Banca</h2>
          <p>Bonjour <strong>${loan.firstName} ${loan.lastName?.toUpperCase()}</strong>,</p>
          <p>Votre dossier de financement a été officiellement approuvé par la Direction Générale des Engagements.</p>
          <p>📥 <strong>Votre contrat est disponible :</strong> L'exemplaire officiel de votre contrat de crédit est joint à cet e-mail au format <strong>PDF</strong>.</p>
          <p>Ce document certifié conforme contient votre signature électronique ainsi que l'accord authentifié par le cachet officiel et la signature manuscrite de notre banque.</p>
          <p>Cordialement,<br/>Le Service d'Arbitrage — BPER Banca</p>
        </div>
      `;
    } else {
      loan.status = "REJECTED";
      emailSubject = "Mise à jour de votre dossier — BPER Banca";
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #cbd5e1; padding: 25px;">
          <h2 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px; margin-top: 0;">BPER: Banca</h2>
          <p>Bonjour <strong>${loan.firstName} ${loan.lastName?.toUpperCase()}</strong>,</p>
          <p>Après étude de vos pièces justificatives, nous regrettons de vous informer que votre demande n'a pas pu être acceptée pour le motif suivant :</p>
          <p style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 10px; color: #991b1b; font-weight: bold;">${message}</p>
          <p>Cordialement,<br/>Le Service des Engagements</p>
        </div>
      `;
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

    res.json({ message: "Le dossier a été traité avec succès. L'e-mail contenant l'offre PDF officielle a été envoyé au client." });
  } catch (err) {
    console.error("Erreur critique d'administration :", err);
    res.status(500).json({ message: "Erreur lors du traitement ou de l'envoi du courrier." });
  }
});

module.exports = router;