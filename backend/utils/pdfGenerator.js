const PDFDocument = require("pdfkit");

exports.generateAccountPDF = (user, account) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    let buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    // --- EN-TÊTE ---
    doc.fontSize(20).text("BPER BANCA", { align: "right" });
    doc.fontSize(10).text("Document Officiel de Bienvenue", { align: "right" });
    doc.moveDown();

    // --- TITRE ---
    doc.fontSize(16).fillColor("#2c3e50").text("RELEVÉ D'IDENTITÉ BANCAIRE (RIB)", { underline: true });
    doc.moveDown();

    // --- INFOS CLIENT ---
    doc.fillColor("black").fontSize(12).text(`Titulaire du compte : ${user.prenom} ${user.nom}`);
    doc.text(`Identifiant Personnel : ${user.personalId}`);
    doc.moveDown();

    // --- TABLEAU DES COORDONNÉES ---
    doc.rect(50, doc.y, 500, 120).stroke();
    const tableTop = doc.y + 10;

    doc.font("Helvetica-Bold").text("IBAN (International Bank Account Number)", 60, tableTop);
    doc.font("Helvetica").text(account.iban, 60, tableTop + 15);

    doc.font("Helvetica-Bold").text("CODE BIC (SWIFT)", 60, tableTop + 40);
    doc.font("Helvetica").text(account.bic, 60, tableTop + 55);

    doc.font("Helvetica-Bold").text("NUMÉRO DE COMPTE", 60, tableTop + 80);
    doc.font("Helvetica").text(account.accountNumber, 60, tableTop + 95);

    // --- PIED DE PAGE ---
    doc.fontSize(8).fillColor("gray").text(
      "BPER Banca S.p.A. - Siège social : Via San Carlo, 8/20, Modène. Membre du Fonds Interbancaire de Garantie des Dépôts.",
      50, 700, { align: "center" }
    );

    doc.end();
  });
};