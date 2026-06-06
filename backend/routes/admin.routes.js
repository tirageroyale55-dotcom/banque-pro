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





// 🔥 Éléments officiels de la Direction Générale BPER Banca (SVG haute définition)
const BPER_STAMP_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="%23004f52" stroke-width="2"/><circle cx="50" cy="50" r="40" fill="none" stroke="%23004f52" stroke-width="1"/><text x="50" y="35" font-family="Arial" font-size="6" font-weight="bold" fill="%23004f52" text-anchor="middle">BPER: BANCA S.p.A.</text><text x="50" y="52" font-family="Arial" font-size="5" font-weight="bold" fill="%23004f52" text-anchor="middle">DIRECTION GÉNÉRALE</text><text x="50" y="65" font-family="Arial" font-size="4" fill="%23004f52" text-anchor="middle">* POLE ENGAGEMENTS *</text><text x="50" y="78" font-family="Arial" font-size="6" font-weight="bold" fill="%23004f52" text-anchor="middle">APPROUVÉ</text></svg>`;

const BPER_DIRECTOR_SIGNATURE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80" viewBox="0 0 200 80"><path d="M20,50 Q40,20 60,45 T100,30 T140,55 T180,25 M50,35 L160,45 M80,20 Q100,60 110,55" fill="none" stroke="%23004f52" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// Route de décision de l'administrateur
router.post("/loan-decision/:loanId", auth, role("ADMIN"), async (req, res) => {
  let tempClientSignaturePath = null;

  try {
    const { decision, message } = req.body;
    
    // 1. Récupération complète du dossier et de l'utilisateur
    const loan = await LoanRequest.findById(req.params.loanId).populate("user");
    if (!loan) return res.status(404).json({ message: "Demande introuvable" });

    // Configuration du transporteur d'e-mail (Zoho)
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
      emailSubject = `Votre contrat de crédit signé et approuvé - Réf: BPER-CONTRACT-${loan._id}`;

      const clientFullName = `${loan.firstName} ${loan.lastName.toUpperCase()}`;
      const contractDate = new Date(loan.createdAt).toLocaleDateString("fr-FR");
      const approvalDate = new Date().toLocaleDateString("fr-FR");

      // 🛠️ FIX SÉCURITÉ CONTRAT : Sauvegarde physique temporaire de la signature Base64 du client sur le serveur
      if (loan.signatureData && loan.signatureData.includes("base64,")) {
        const base64Content = loan.signatureData.split("base64,")[1];
        const tempFileName = `sig_${loan._id}_${Date.now()}.png`;
        tempClientSignaturePath = path.join(__dirname, "../temp", tempFileName);

        // Crée le dossier temp s'il n'existe pas
        if (!fs.existsSync(path.join(__dirname, "../temp"))) {
          fs.mkdirSync(path.join(__dirname, "../temp"));
        }

        // Écriture du fichier image réel sur le disque dur du serveur
        fs.writeFileSync(tempClientSignaturePath, base64Content, "base64");
      }

      // 🔄 REPRODUCTION STRICTE ET EXACTE DU CORPS DU CONTRAT DE PRODUITS.JSX POUR LE PDF
      const htmlContentForPDF = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Times New Roman', Times, serif; padding: 30px; color: #000; line-height: 1.6; text-align: justify; background-color: #fff; }
            .header-fixed { border-bottom: 2px solid #004f52; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .logo-bper { font-size: 1.4rem; font-weight: bold; letter-spacing: 1px; color: #004f52; }
            .ref-bper { font-size: 0.75rem; opacity: 0.8; font-family: sans-serif; color: #475569; }
            .contract-wrapper { width: 100%; max-width: 800px; margin: 0 auto; color: #000; }
            .title-section { text-align: center; marginBottom: 30px; border-bottom: 2px solid #004f52; padding-bottom: 15px; }
            .title-section h1 { fontSize: 1.5rem; color: #004f52; margin: 0 0 5px 0; text-transform: uppercase; }
            .title-section p { margin: 0; font-style: italic; color: #475569; fontSize: 0.8rem; font-family: sans-serif; }
            .meta-info { background: #f8fafc; padding: 12px; border-radius: 6px; margin-bottom: 25px; border: 1px solid #cbd5e1; font-family: sans-serif; fontSize: 0.85rem; }
            .meta-info p { margin: 3px 0; }
            h3 { color: #004f52; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; fontSize: 1.05rem; marginTop: 20px; font-weight: bold; text-transform: uppercase; }
            p { font-size: 0.95rem; margin-bottom: 15px; }
            .footer-mention { marginTop: 40px; border-top: 1px solid #000; paddingTop: 10px; display: flex; justify-content: space-between; fontSize: 0.8rem; font-style: italic; }
            
            /* 🏦 STRUCTURE SCELLÉE DES DOUBLE SIGNATURES EXIGÉE */
            .signatures-bloc { margin-top: 50px; display: flex; justify-content: space-between; align-items: flex-start; page-break-inside: avoid; }
            .box-client { width: 45%; text-align: left; font-family: sans-serif; font-size: 0.85rem; }
            .box-director { width: 45%; text-align: right; font-family: sans-serif; font-size: 0.85rem; position: relative; }
            .img-sig-client { border: 1px dashed #004f52; width: 180px; height: 85px; object-fit: contain; background: #fafafa; margin-top: 10px; display: block; }
            .img-sig-director { width: 170px; height: 70px; object-fit: contain; margin-top: 8px; display: inline-block; }
            .img-stamp-bper { width: 100px; height: 100px; position: absolute; right: 120px; top: 10px; opacity: 0.9; }
          </style>
        </head>
        <body>
          <div class="contract-wrapper">
            <div class="header-fixed">
              <div class="logo-bper">BPER: Banca</div>
              <div class="ref-bper">RÉF: BPER-CONTRACT-${loan._id}</div>
            </div>

            <div class="title-section">
              <h1>Offre Préalable de Crédit</h1>
              <p>Contrat régi conformément aux directives bancaires européennes</p>
            </div>

            <div class="meta-info">
              <p><strong>Organisme Prêteur :</strong> BPER Banca S.p.A.</p>
              <p><strong>Bénéficiaire :</strong> ${loan.civility} ${loan.lastName.toUpperCase()} ${loan.firstName}</p>
              <p><strong>Profession du client :</strong> <span style="color: #004f52; font-weight: bold;">${loan.profession || "Salarié"}</span></p>
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

            <div class="footer-mention">
              <span>Mention : "Bon pour acceptation de l'offre de crédit"</span>
              <span>Émis par BPER Banca S.p.A.</span>
            </div>

            <!-- 🏦 APPLICATION STRICTE DES DOUBLE SIGNATURES VISUELLES DU COMPTE RENDU -->
            <div class="signatures-bloc">
              <!-- BAS À GAUCHE : LE CLIENT AVEC SON NOM, PRÉNOM ET DATE -->
              <div class="box-client">
                <strong style="color: #004f52;">L'Emprunteur (Signataire numérique) :</strong><br/>
                <span style="font-size: 12px; color: #334155;">Nom : ${loan.lastName.toUpperCase()} ${loan.firstName}</span><br/>
                <span style="font-size: 12px; color: #334155;">Fait le : ${contractDate}</span>
                <!-- Chargement sécurisé de la vraie image générée depuis le disque local -->
                <img class="img-sig-client" src="file://${tempClientSignaturePath}" alt="Signature Client Officielle"/>
              </div>

              <!-- BAS À DROITE : LE DIRECTEUR GENERAL, SA SIGNATURE ET LE CACHET BANCAIRE -->
              <div class="box-director">
                <strong style="color: #004f52;">Pour la banque BPER Banca :</strong><br/>
                <span style="font-size: 12px; color: #334155;">Le Directeur Général des Engagements</span><br/>
                <span style="font-size: 12px; color: #334155;">Validé le : ${approvalDate}</span><br/>
                
                <!-- Le tampon officiel de la banque se positionne exactement derrière la signature du directeur -->
                <img class="img-stamp-bper" src="${BPER_STAMP_SVG}" alt="Cachet Officiel BPER"/>
                <img class="img-sig-director" src="${BPER_DIRECTOR_SIGNATURE}" alt="Signature Direction"/>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      // 3. Lancement du module html-pdf-node pour figer le HTML en fichier PDF physique A4 détachables
      let options = { format: "A4", margin: { top: "20mm", bottom: "20mm", left: "20mm", right: "20mm" } };
      let file = { content: htmlContentForPDF };
      const pdfBuffer = await pdfTemplate.generatePdf(file, options);

      // Ajout du fichier PDF sécurisé dans le tableau des pièces jointes de l'e-mail
      emailAttachments.push({
        filename: `Contrat_Pret_BPER_Signe_${loan.lastName.toUpperCase()}.pdf`,
        content: pdfBuffer
      });

      // Corps du mail d'accompagnement envoyé à l'utilisateur
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #cbd5e1; padding: 25px; background: #ffffff;">
          <div style="border-bottom: 3px solid #004f52; padding-bottom: 10px; margin-bottom: 20px;">
            <h2 style="color: #004f52; margin: 0;">BPER: Banca</h2>
          </div>
          <p>Félicitations, votre demande de prêt a été approuvée par nos services financiers.</p>
          <p>Veuillez trouver en pièce jointe de ce mail votre <strong>contrat officiel définitif au format PDF</strong>.</p>
          <p>Ce document PDF contient l'intégralité des clauses acceptées, revêtu de votre <strong>signature électronique en bas à gauche</strong> et de la validation signée de notre <strong>Directeur Général accompagnée du cachet officiel BPER Banca à droite</strong>.</p>
          <p>Nous vous invitons à télécharger la pièce jointe pour conserver votre exemplaire légal.</p>
          <br/>
          <p>Cordialement,<br/><strong>Le Service des Engagements — BPER Banca</strong></p>
        </div>
      `;

    } else if (decision === "REJECTED") {
      loan.status = "REJECTED";
      emailSubject = "Mise à jour concernant votre demande de financement - BPER Banca";
      emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>BPER: Banca</h2>
          <p>Après étude de votre dossier, nous regrettons de ne pas pouvoir donner une suite favorable à votre demande de crédit pour le motif suivant :</p>
          <blockquote style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 10px;">${message}</blockquote>
        </div>
      `;
    }

    // Sauvegarde du changement de statut en base de données
    await loan.save();

    // Envoi de l'e-mail avec la pièce jointe PDF
    await transporter.sendMail({
      from: `"BPER Banca - Service Crédits" <${process.env.MAIL_USER}>`,
      to: loan.user.email,
      subject: emailSubject,
      html: emailHtml,
      attachments: emailAttachments
    });

    // Nettoyage immédiat : suppression du fichier image temporaire du serveur pour la sécurité des données
    if (tempClientSignaturePath && fs.existsSync(tempClientSignaturePath)) {
      fs.unlinkSync(tempClientSignaturePath);
    }

    res.json({ message: "Le contrat PDF avec les doubles signatures officielles a bien été envoyé au client." });

  } catch (err) {
    console.error("Erreur critique serveur :", err);
    // Nettoyage du fichier en cas de crash
    if (tempClientSignaturePath && fs.existsSync(tempClientSignaturePath)) {
      fs.unlinkSync(tempClientSignaturePath);
    }
    res.status(500).json({ message: "Erreur lors de la génération du contrat officiel." });
  }
});

module.exports = router;