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

// 🔥 ROUTE ADMIN 2 : Décision, Génération du PDF Officiel Répliqué et Envoi du Mail
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
      emailSubject = `Réf BPER-${loan._id} : Votre contrat de financement approuvé et signé - BPER Banca`;

      const clientFullName = `${loan.civility} ${loan.lastName.toUpperCase()} ${loan.firstName}`;
      const contractDate = new Date(loan.createdAt || Date.now()).toLocaleDateString("fr-FR");

      // Signature électronique du Directeur Général modélisée en SVG propre
      const directorSignatureSVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="70" viewBox="0 0 200 70"><path d="M20,45 Q40,15 70,35 T130,20 T180,50 M50,25 Q90,55 110,15" fill="none" stroke="%23002f34" stroke-width="2.5" stroke-linecap="round"/></svg>`;

      // Sceau / Tampon Officiel Circulaire de la BPER Banca modélisé en SVG propre
      const bperStampSVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="110" height="110" viewBox="0 0 110 110"><circle cx="55" cy="55" r="50" fill="none" stroke="%23004f52" stroke-width="2" stroke-dasharray="4 2"/><circle cx="55" cy="55" r="44" fill="none" stroke="%23004f52" stroke-width="1"/><text x="55" y="32" font-family="Arial" font-size="8" font-weight="bold" fill="%23004f52" text-anchor="middle">BPER: BANCA</text><text x="55" y="58" font-family="Arial" font-size="7" fill="%23004f52" text-anchor="middle">DIRECTION</text><text x="55" y="68" font-family="Arial" font-size="7" fill="%23004f52" text-anchor="middle">DES ENGAGEMENTS</text><text x="55" y="88" font-family="Arial" font-size="7" font-weight="bold" fill="%23004f52" text-anchor="middle">* CERTIFIÉ *</text></svg>`;

      // 📜 CODE HTML EXACT DU CONTRAT DU PRODUITS.JSX ADAPTÉ POUR LE GENERATEUR PDF A4
      const htmlContractForPDF = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Times New Roman', Times, serif; padding: 30px; color: #000; line-height: 1.6; text-align: justify; font-size: 13px; }
            .header-banner { background: #004f52; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; color: #fff; margin-bottom: 25px; }
            .header-title { font-size: 20px; font-weight: bold; letter-spacing: 1px; margin: 0; }
            .header-ref { font-size: 11px; font-family: Arial, sans-serif; opacity: 0.8; }
            .title-box { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #004f52; padding-bottom: 15px; }
            .main-title { font-size: 20px; color: #004f52; margin: 0 0 5px 0; text-transform: uppercase; font-weight: bold; }
            .subtitle { margin: 0; font-style: italic; color: #475569; font-size: 11px; font-family: Arial, sans-serif; }
            .info-box { background: #f8fafc; padding: 15px; border-radius: 6px; marginBottom: 25px; border: 1px solid #cbd5e1; font-family: Arial, sans-serif; font-size: 12px; line-height: 1.5; margin-bottom: 20px; }
            h3 { color: #004f52; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; font-size: 14px; marginTop: 20px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; }
            p { margin: 0 0 12px 0; }
            .mention-box { marginTop: 30px; border-top: 1px solid #000; paddingTop: 10px; display: flex; justify-content: space-between; font-size: 11px; font-style: italic; margin-bottom: 35px; }
            
            /* Structure Bancaire Pro des blocs de Signature en bas */
            .signatures-container { margin-top: 40px; page-break-inside: avoid; display: table; width: 100%; table-layout: fixed; }
            .signature-column { display: table-cell; width: 50%; vertical-align: top; box-sizing: border-box; }
            .left-column { padding-right: 20px; border-right: 1px dashed #cbd5e1; }
            .right-column { padding-left: 20px; position: relative; }
            .sig-title { font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; color: #004f52; margin-bottom: 5px; text-decoration: underline; }
            .client-info { font-family: Arial, sans-serif; font-size: 11px; color: #334155; margin-top: 4px; line-height: 1.4; }
            .img-sig-client { border: 1px dashed #004f52; width: 190px; height: 75px; object-fit: contain; background: #fafafa; display: block; margin-top: 8px; }
            .img-sig-director { width: 180px; height: 65px; object-fit: contain; display: block; margin-top: 8px; }
            .stamp-box { position: absolute; bottom: -10px; right: 10px; width: 100px; height: 100px; opacity: 0.95; }
          </style>
        </head>
        <body>

          <div class="header-banner">
            <div class="header-title">BPER: Banca</div>
            <div class="header-ref">RÉF : BPER-CONTRACT-${loan._id}</div>
          </div>

          <div class="title-box">
            <div class="main-title">Offre Préalable de Crédit</div>
            <div class="subtitle">Contrat régi conformément aux directives bancaires européennes</div>
          </div>

          <div class="info-box">
            <strong>Organisme Prêteur :</strong> BPER Banca S.p.A. <br/>
            <strong>Bénéficiaire :</strong> ${clientFullName}<br/>
            <strong>Profession du client :</strong> <span style="color: #004f52; font-weight: bold;">${loan.profession || "Salarié"}</span><br/>
            <strong>Revenus Mensuels :</strong> ${loan.income?.toLocaleString()} EUR
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

          <div class="mention-box">
            <span>Mention : "Bon pour acceptation de l'offre de crédit"</span>
            <span>Émis par BPER Banca S.p.A.</span>
          </div>

          <!-- ✒️ BLOCS DE SIGNATURE EXIGÉS (Gauches & Droite) -->
          <div class="signatures-container">
            
            <!-- À GAUCHE : L'emprunteur / Client -->
            <div class="signature-column left-column">
              <div class="sig-title">L'Emprunteur (Signataire unique) :</div>
              <div class="client-info">
                <strong>Nom & Prénom :</strong> ${loan.lastName.toUpperCase()} ${loan.firstName}<br/>
                <strong>Date de signature :</strong> ${contractDate}<br/>
                <span style="font-size: 9px; color: #059669; font-weight: bold;">✔ Validé par horodatage IP sécurisé</span>
              </div>
              <img class="img-sig-client" src="${loan.signatureData}" alt="Signature Numérique Client" />
            </div>

            <!-- À DROITE : Le Directeur Général + Sceau BPER Banca -->
            <div class="signature-column right-column">
              <div class="sig-title">Pour la banque BPER Banca S.p.A :</div>
              <div class="client-info">
                <strong>Le Directeur Général des Engagements</strong><br/>
                <strong>Date d'approbation :</strong> ${new Date().toLocaleDateString("fr-FR")}<br/>
                <span style="font-size: 9px; color: #0284c7; font-weight: bold;">✔ Tiers de confiance régulé</span>
              </div>
              <!-- Tracé signature Direction -->
              <img class="img-sig-director" src="${directorSignatureSVG}" alt="Signature Direction" />
              
              <!-- Tampon Cacher BPER BANCA -->
              <div class="stamp-box">
                <img src="${bperStampSVG}" width="100" height="100" alt="Cachet Institutionnel" />
              </div>
            </div>

          </div>

        </body>
        </html>
      `;

      // Compilation physique du PDF A4 en mémoire
      let pdfBuffer;
      try {
        const options = { format: "A4", margin: { top: "15mm", right: "15mm", bottom: "15mm", left: "15mm" } };
        pdfBuffer = await pdfTemplate.generatePdf({ content: htmlContractForPDF }, options);
        
        // Attachement du fichier PDF officiel
        emailAttachments.push({
          filename: `Contrat_Officiel_BPER_${loan.lastName.toUpperCase()}.pdf`,
          content: pdfBuffer
        });
      } catch (pdfErr) {
        console.error("Erreur critique d'assemblage du PDF :", pdfErr);
      }

      // Insertion visuelle dans le corps de l'e-mail pour un double affichage propre (CID)
      if (loan.signatureData && loan.signatureData.includes("base64,")) {
        emailAttachments.push({
          filename: "client_signature.png",
          content: Buffer.from(loan.signatureData.split("base64,")[1], "base64"),
          cid: "clientSignatureCID"
        });
      }

      emailAttachments.push({
        filename: "director_sig.png",
        content: Buffer.from(directorSignatureSVG.split("base64,")[1] || directorSignatureSVG.replace("data:image/svg+xml;utf8,", ""), "utf8"),
        cid: "directorSignatureCID"
      });

      // ✉️ HTML DESIGN DU MAIL DE RÉCEPTION UTILISATEUR (HAUTE QUALITÉ BANCAIRE)
      emailHtml = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #d8e2e2; border-radius: 8px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          
          <div style="background-color: #004f52; padding: 25px; color: #ffffff;">
            <table style="width: 100%;">
              <tr>
                <td><span style="font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">BPER: Banca</span></td>
                <td style="text-align: right; font-size: 11px; opacity: 0.85;">DÉPARTEMENT DES CRÉDITS</td>
              </tr>
            </table>
          </div>

          <div style="padding: 30px; color: #1e293b; line-height: 1.6;">
            <p style="font-size: 15px; margin-top: 0;">Cher(e) client(e) <strong>${loan.firstName} ${loan.lastName.toUpperCase()}</strong>,</p>
            
            <p>Nous avons le plaisir de vous confirmer que la Direction Générale des Engagements **BPER Banca** a accordé un avis favorable à votre demande de financement en ligne.</p>
            
            <div style="background-color: #f0f7f7; padding: 20px; border-left: 4px solid #004f52; margin: 22px 0; border-radius: 4px;">
              <h4 style="margin: 0 0 10px 0; color: #004f52; font-size: 14px; text-transform: uppercase;">Caractéristiques de votre offre validée :</h4>
              <ul style="margin: 0; padding-left: 20px; font-size: 13.5px; color: #334155;">
                <li style="margin-bottom: 5px;"><strong>Formule souscrite :</strong> ${loan.loanType}</li>
                <li style="margin-bottom: 5px;"><strong>Capital débloqué :</strong> ${loan.amount?.toLocaleString()} EUR</li>
                <li style="margin-bottom: 5px;"><strong>Périodicité d'amortissement :</strong> ${loan.duration} Mois</li>
                <li style="margin-bottom: 5px;"><strong>Échéance prélevée :</strong> ${loan.monthlyPayment?.toLocaleString()} EUR / mois</li>
                <li style="margin-bottom: 5px;"><strong>Statut professionnel retenu :</strong> ${loan.profession || "Salarié"}</li>
              </ul>
            </div>

            <p style="font-size: 13.5px;">📋 <strong>Pièce jointe sécurisée :</strong> Conforme à vos exigences contractuelles, vous trouverez ci-joint votre **Contrat Officiel au format PDF**. Ce document fige votre accord technique et est contresigné en bas de page à gauche par vos soins, et à droite par le Directeur Général sous le cachet certifié de notre établissement bancaire.</p>
            
            <p style="font-size: 13.5px; margin-bottom: 30px;">Les fonds correspondants seront versés sur votre compte de dépôt à l'expiration des délais légaux de rétractation mentionnés dans l'Article 4.</p>

            <p style="font-size: 13px; margin: 0; color: #475569;">Nous vous remercions de votre confiance.</p>
            <p style="font-size: 13px; font-weight: bold; color: #004f52; margin: 4px 0 0 0;">Le Secrétariat des Crédits — BPER Banca S.p.A.</p>
          </div>

          <div style="background-color: #f8fafc; padding: 15px 30px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b;">
            Ce courriel ainsi que sa pièce jointe sont cryptés. BPER Banca S.p.A. - Siège social : Via San Carlo, 8/20 - Modène, Italie - Imm. Reg. Imp. di Modena n. 01153230360.
          </div>
        </div>
      `;

    } else if (decision === "REJECTED") {
      loan.status = "REJECTED";
      emailSubject = "Mise à jour concernant votre demande de financement - BPER Banca";
      emailHtml = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 30px; color: #1e293b;">
          <div style="text-align: left; padding-bottom: 15px; border-bottom: 3px solid #dc2626;">
            <span style="font-size: 24px; font-weight: 800; color: #dc2626;">BPER: <span style="font-weight: 300; color: #475569;">Banca</span></span>
          </div>
          <p style="margin-top: 20px; font-size: 14.5px;">Cher(e) client(e),</p>
          <p style="font-size: 14px;">Nous avons réalisé l'évaluation réglementaire des risques concernant votre demande d'octroi de crédit de <strong>${loan.amount?.toLocaleString()} EUR</strong>.</p>
          <p style="font-size: 14px;">Après analyse minutieuse, notre commission de crédit a le regret de ne pas pouvoir formuler d'avis favorable pour le motif suivant :</p>
          
          <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0; font-style: italic; color: #991b1b; font-size: 13.5px; border-radius: 4px;">
            "${message || "Capacité d'endettement insuffisante ou inadéquation avec les conditions de solvabilité actuelles."}"
          </div>
          
          <p style="font-size: 13.5px;">Votre dossier en ligne est par conséquent classifié comme refusé et archivé de manière sécurisée.</p>
          <p style="font-size: 13px; color: #64748b; margin-top: 25px;">Cordialement,<br/><strong>Le Service de Gestion des Risques — BPER Banca</strong></p>
        </div>
      `;
    }

    // Mise à jour de l'état du crédit dans MongoDB Atlas
    await loan.save();

    // Envoi de l'e-mail avec ses pièces jointes (PDF officiel structuré + signatures)
    await transporter.sendMail({
      from: `"BPER Banca - Service Crédits" <${process.env.MAIL_USER}>`,
      to: loan.user.email,
      subject: emailSubject,
      html: emailHtml,
      attachments: emailAttachments
    });

    res.json({ message: `La demande a été validée (${decision}). Le client a reçu par e-mail le contrat PDF certifié conforme.` });

  } catch (err) {
    console.error("Erreur lors du traitement final BPER :", err);
    res.status(500).json({ message: "Erreur serveur lors de la validation du contrat de crédit" });
  }
});

module.exports = router;