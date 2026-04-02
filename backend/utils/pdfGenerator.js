const PDFDocument = require("pdfkit");

exports.generateAccountPDF = (user, account) => {
  return new Promise((resolve, reject) => {
    // Configuration Paysage (A4 Landscape)
    const doc = new PDFDocument({ 
      size: 'A4', 
      layout: 'landscape',
      margin: 50 
    });
    
    let buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    const bperColor = "#005a64"; // Couleur Canard/Bleu pétrole Pro
    const lightGray = "#f2f2f2";

    // --- EN-TÊTE ---
    // Note: Si tu as un logo.png dans ton dossier public, utilise doc.image('public/logo.png', 50, 45, {width: 100})
    doc.fillColor(bperColor).fontSize(22).font("Helvetica-Bold").text("BPER", 50, 50);
    doc.fontSize(10).font("Helvetica").text("Banca", 50, 75);
    
    doc.fillColor("#333").fontSize(16).font("Helvetica-Bold")
       .text("RELEVÉ D'IDENTITÉ BANCAIRE (RIB)", 0, 60, { align: "center" });
    
    doc.moveDown(3);

    // --- PHRASE D'INTRODUCTION ---
    doc.fillColor("#000").fontSize(11).font("Helvetica")
       .text("Nous soussignés, BPER BANCA, attestons l'exactitude des références de compte ci-dessous :", 50, 130);

    doc.moveDown(1);

    // --- TABLEAU DES COORDONNÉES (STYLE PRO) ---
    const tableTop = 160;
    const colWidth = 180;

    // Fond du tableau
    doc.rect(50, tableTop, 740, 80).fill(lightGray).stroke(bperColor);
    doc.fillColor(bperColor);

    // Titres des colonnes
    doc.font("Helvetica-Bold").fontSize(10);
    doc.text("IBAN (Numéro de compte international)", 70, tableTop + 15);
    doc.text("CODE BIC (SWIFT)", 400, tableTop + 15);
    doc.text("NUMÉRO DE COMPTE", 620, tableTop + 15);

    // Données des colonnes
    doc.fillColor("#000").font("Courier-Bold").fontSize(14);
    doc.text(account.iban, 70, tableTop + 40);
    doc.text(account.bic, 400, tableTop + 40);
    doc.text(account.accountNumber, 620, tableTop + 40);

    // --- INFORMATIONS TITULAIRE ---
    doc.moveDown(4);
    doc.fillColor(bperColor).font("Helvetica-Bold").fontSize(11).text("TITULAIRE DU COMPTE :");
    doc.fillColor("#000").font("Helvetica").fontSize(12).text(`${user.prenom.toUpperCase()} ${user.nom.toUpperCase()}`);
    doc.fontSize(10).text(`Identifiant Client : ${user.personalId}`);

    // --- ATTESTATION FINALE ---
    const today = new Date().toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    
    doc.moveDown(3);
    doc.font("Helvetica-Oblique").fontSize(10)
       .text(`Cette attestation est délivrée pour servir et valoir ce que de droit, faite le ${today}.`, { align: "left" });

    // --- PIED DE PAGE ---
    const bottomY = doc.page.height - 70;
    doc.lineCap('butt').moveTo(50, bottomY).lineTo(790, bottomY).stroke(bperColor);
    
    doc.fontSize(8).fillColor("gray").font("Helvetica")
       .text(
         "BPER Banca S.p.A. - Siège social : Via San Carlo, 8/20, 41121 Modène, Italie. " +
         "Inscrite au registre des banques sous le n° 5387. Membre du Fonds Interbancaire de Garantie des Dépôts.",
         50, bottomY + 15, { align: "center", width: 740 }
       );

    doc.end();
  });
};