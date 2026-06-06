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





const VRAI_CACHET_BPER_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH6AYGEw0BC9j3VwAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUOdB44MAAALJSURBVHja7dw9TgMxEAdgHwI6SgS6NByAE6ByAnIEToCOgA7pOAAnQId0HIAToKNE6SgR8SbySZZZ79or2/F7pKUrW971z87Y690mZVmOALB3fSgA0ANgAIABAIYAGAAYAGAIgAGA7gAGAIYAGAAYAGAAYACAAYABgAEAhgAYABgAYABA6b97WpblWNuXN/YqTf1eU7XvXfNqD8wAmAIwBWA69gN/B9B9AnG26+R9n6p7/6wHegBMAZgCMD3vgbwH9gCYAjAFYArAnvXA3gNTAKbfAfY++77Pue6/7RrvgSkA0/MeyHsg74E9AKYATAHY+x7Ye2AKwBTAFIAGwBSABsAUgAbAFIAGwBSABsAUgAbAFIAGwO96wE8A6b6M0XWf9f3X636CAdAAmALQAJgC0ACYApgC0ACYAtAAmALQAJgCmALQAJgC0ACYAtAAmAKYAtAAmALQAJgC0ACYArgrgN7r5C5m/b6u+6zvA9AAmALQAJgC0ACYArgrgP0E6D59vdYg7zXee6wBaABMAUwBaABMAUwB3BXAfgJkv98ZgAbAFMAUgAbAFMAUgAbAFIApAA2AKQANgCkADYApgCkADYApAA2AKQANgCmAuwPIvsasvS8Atu8D0ACYAtAAmALQAJgCuCuA7mvyvIexBvYBaAFMAUwBaABMAUwB3BXAfgLMvtdYg7zX9D6XAWgATAFrA9j77Nq/vOex76Prv7bX9wFoAEwBaABMAWwFmPscu8++r6v/v9f3AWgATAEYAmAIgAGAgQE0AMAQAEMADAAwBMAQwO0ArO8KID3Yp+q+v76vAWgATAEYAmAIgAEAhgAYAGAAYACAAYABgAEAhgAYAGAAYABA9z0ArO8LQLovY/Teo77HAFwOAA0AMADAwAB698D6bgDSw6+fV9/vADQAwBAAQwAMAOjuHwD6vgbYdwOYHgAs/wB2bYw13bZ9HAAAAABJRU5ErkJggg==";
const VRAIE_SIGNATURE_DIRECTEUR_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAA8CAYAAACxk9WvAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH6AYGEw4XBy87ywAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUOdB44MAAAGPSURBVHja7duxSgMxFIXhM06CiIuDo9vruKjPoKuj76Cvo6vP4KDoKDoKDo6OTh0UdBJEB6XnyA1XskmTJm2apv8HDgTSpOfm3pS0bVsCwD7XoQAIAQgBCIEIgBCIEIAQiBAIEIAQiBCIEIAQgBCIEIAQiBCIEAgQgBCIEIAQgBCIEIgQCBCIEIgQCBCIEIgQCBAIEIgQCBAIEIgQiBAIEIgQiBAIEIgQiBCIEAgQCBCIEIgQiBAIEAgQCBAIEAgQCBCIEIgQCBCIEIgQCBCAEIgQCBCAEIgQiBCIEAiYAtHeVfG+FwK+9iEAZmBKCBAIEAgQCBAIEAgQCBAIEAgQCBAIEAgQCBAIEAgQCBAIEAgQCBCIEAgQCBAIEAgQCBDo6ZByS3fW+p1hNshYAmAGpoQAgQCBAIEAgQCBAIEAgQCBAIEAgQCBAIEAgQCBAIEAgQCBAIEAgUiBAIEAgQCBAIEAgQCBAIFuBWTscuK9f7v+N8gGGAshQCBAIEAgQCBAIEAgQODvAmTsh9Xf0bEXAjMwJQToB3wBC+wI06G7vBYAAAAASUVORK5CYII=";



// 1. Récupération des prêts
router.get("/loans/pending", auth, role("ADMIN"), async (req, res) => {
  try {
    const pendingLoans = await LoanRequest.find({ status: "PENDING" }).populate("user");
    res.json(pendingLoans);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur lors de la récupération" });
  }
});

// 2. Acceptation, Création du PDF avec les vraies images et envoi par mail
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

      // GÉNÉRATION COMPATIBLE VERCEL VIA PDFKIT
      const pdfBuffer = await new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 40, size: "A4" });
        let buffers = [];
        
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", (err) => reject(err));

        // En-tête de la Modale reproduite en PDF
        doc.rect(0, 0, 600, 60).fill("#004f52");
        doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(20).text("BPER: Banca", 40, 22);
        doc.fontSize(9).font("Helvetica").text(`RÉF: BPER-CONTRACT-${loan._id}`, 420, 26);

        // Titre Principal
        doc.moveDown(4);
        doc.fillColor("#004f52").font("Times-Bold").fontSize(22).text("Offre Préalable de Crédit", { align: "center" });
        doc.fillColor("#475569").font("Times-Italic").fontSize(10).text("Contrat régi conformément aux directives bancaires européennes", { align: "center" });
        
        // Cadre Profil du Client
        doc.moveDown(2);
        doc.rect(40, doc.y, 515, 75).fill("#f8fafc").stroke("#cbd5e1");
        doc.fillColor("#000000").font("Helvetica").fontSize(10);
        doc.text(`Organisme Prêteur : BPER Banca S.p.A.`, 50, doc.y - 65);
        doc.text(`Bénéficiaire : ${loan.civility} ${clientFullName}`, 50, doc.y + 2);
        doc.font("Helvetica-Bold").text(`Profession du client : `, 50, doc.y + 2);
        doc.fillColor("#004f52").text(`${loan.profession || "Salarié"}`, 155, doc.y - 12);
        doc.fillColor("#000000").font("Helvetica").text(`Revenus Mensuels : ${loan.income?.toLocaleString()} EUR`, 50, doc.y + 12);

        // Les Articles Légaux (Articles 1 à 5)
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

        // Mentions bas de page (Corrigées sans erreur de syntaxe rouge)
        doc.moveDown(2);
        doc.font("Times-Italic").fontSize(9).text("Mention : \"Bon pour acceptation de l'offre de crédit\"", 40, doc.y);
        doc.text("Émis par BPER Banca S.p.A.", 420, doc.y);

        // SECTION SIGNATURE GEOMÉTRIQUE FIXE
        doc.moveDown(3);
        const ySignatureZone = doc.y;

        // 👈 À GAUCHE : Bloc et Signature de l'utilisateur récupérée depuis Produits.jsx
        doc.fillColor("#004f52").font("Helvetica-Bold").fontSize(10).text("L'Emprunteur (Signataire) :", 40, ySignatureZone);
        doc.fillColor("#000000").font("Helvetica").fontSize(9).text(`Nom : ${clientFullName}`, 40, ySignatureZone + 15);
        doc.text(`Fait en ligne le : ${currentDate}`, 40, ySignatureZone + 28);
        
        if (loan.signatureData && loan.signatureData.includes("base64,")) {
          try {
            const clientSigBuffer = Buffer.from(loan.signatureData.split("base64,")[1], "base64");
            // Pose de la signature automatique du client à gauche
            doc.image(clientSigBuffer, 40, ySignatureZone + 42, { width: 140, height: 55 });
            doc.rect(40, ySignatureZone + 42, 140, 55).lineWidth(1).dash(4, { space: 2 }).stroke("#cbd5e1");
          } catch (e) {
            doc.text("[Signature Numérique Certifiée]", 40, ySignatureZone + 45);
          }
        }

        // 👉 À DROITE : Vrai Cachet Officiel et Vraie Griffe du Directeur Général
        doc.fillColor("#004f52").font("Helvetica-Bold").fontSize(10).text("Pour la banque BPER Banca :", 360, ySignatureZone);
        doc.fillColor("#000000").font("Helvetica").fontSize(9).text("Le Directeur Général des Engagements", 360, ySignatureZone + 15);
        doc.text(`Approuvé le : ${currentDate}`, 360, ySignatureZone + 28);
        
        // 🛡️ DESSIN VECTORIEL DU VRAI CACHET BPER BANCA (Garantie zéro bug sur Vercel)
        const centerX = 400;
        const centerY = ySignatureZone + 75;
        
        // Cercle extérieur du tampon
        doc.circle(centerX, centerY, 32).lineWidth(1.5).stroke("#004f52");
        // Cercle intérieur du tampon
        doc.circle(centerX, centerY, 27).lineWidth(0.5).stroke("#004f52");
        
        // Mentions à l'intérieur du cachet officiel
        doc.fillColor("#004f52").font("Helvetica-Bold").fontSize(5);
        doc.text("BPER: BANCA S.p.A.", centerX - 22, centerY - 15, { width: 44, align: "center" });
        doc.font("Helvetica").fontSize(4);
        doc.text("DIRECTION DES", centerX - 20, centerY - 2, { width: 40, align: "center" });
        doc.text("ENGAGEMENTS", centerX - 20, centerY + 4, { width: 40, align: "center" });
        doc.font("Helvetica-Bold").fontSize(5);
        doc.text("ACCORDÉ", centerX - 20, centerY + 13, { width: 40, align: "center" });

        // ✍️ DESSIN VECTORIEL DE LA VRAIE GRIFFE DU DIRECTEUR (Superposée sur le cachet)
        doc.moveTo(380, centerY + 10)
           .quadraticCurveTo(395, centerY - 25, 410, centerY + 5)
           .quadraticCurveTo(430, centerY - 15, 450, centerY + 15)
           .quadraticCurveTo(470, centerY, 490, centerY + 10)
           .lineWidth(1.5)
           .stroke("#1e3a8a"); // Couleur bleu d'encre de stylo officiel
        
        try {
          // Incrustation du Vrai Cachet de la Banque (Arrière plan)
          const stampBuffer = Buffer.from(VRAI_CACHET_BPER_PNG.split("base64,")[1], "base64");
          doc.image(stampBuffer, 350, ySignatureZone + 42, { width: 75, height: 75 });
          
          // Incrustation de la Vraie Griffe de Signature du Directeur (Superposée par dessus)
          const directorSigBuffer = Buffer.from(VRAIE_SIGNATURE_DIRECTEUR_PNG.split("base64,")[1], "base64");
          doc.image(directorSigBuffer, 410, ySignatureZone + 50, { width: 110, height: 50 });
        } catch (imgErr) {
          doc.fillColor("#dc2626").text("[Erreur graphique : Cachet Certifié Actif]", 360, ySignatureZone + 45);
        }

        doc.end();
      });

      // Liaison finale de la pièce jointe
      emailAttachments.push({
        filename: `Contrat_BPER_Signe_${loan.lastName?.toUpperCase()}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf"
      });

      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #cbd5e1; padding: 25px; background: #fff;">
          <h2 style="color: #004f52; border-bottom: 2px solid #004f52; padding-bottom: 10px; margin-top: 0;">BPER: Banca</h2>
          <p>Bonjour <strong>${loan.firstName} ${loan.lastName?.toUpperCase()}</strong>,</p>
          <p>Nous avons le plaisir de vous annoncer que votre crédit a été validé.</p>
          <p>📥 Votre <strong>Contrat d'Offre Préalable au format PDF</strong> est joint à cet e-mail. Ce document comporte vos informations officielles, votre signature, ainsi que le cachet de notre direction.</p>
          <p>Cordialement,<br/>Le Service d'Arbitrage — BPER Banca</p>
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

    res.json({ message: "Le dossier a été approuvé. Le PDF officiel avec le vrai cachet et la vraie signature du directeur a été envoyé." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors du traitement de la décision." });
  }
});

module.exports = router;