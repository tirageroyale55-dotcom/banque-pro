require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");
const cardRoutes = require("./routes/card.routes");
const cardRequestRoutes = require("./routes/cardRequest.route");
const sendMail = require("./utils/sendMail");

console.log("MONGO_URI au démarrage =", JSON.stringify(process.env.MONGO_URI));

connectDB();

const app = express();

// server.js
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use("/api", cardRoutes);

app.use("/api/client", cardRequestRoutes);
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/client", require("./routes/client.routes"));

app.use("/api/client", require("./routes/card.routes"));


app.use("/api/transaction", require("./routes/transaction.routes"));
app.use("/api/transactions", require("./routes/transaction.routes"));

// Route de vérification ultra-sécurisée
app.post("/api/internal/verify-iban", async (req, res) => {
    const { apiKey, iban, bic } = req.body;

    // 1. Vérification de la clé secrète
    if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
        return res.status(403).json({ error: "Accès non autorisé" });
    }

    try {
        // 2. Importation correcte du modèle Account (un seul point .)
        const Account = require("./models/Account");
       
        // Nettoyage des chaînes pour éviter les faux négatifs
        const searchIban = (iban || "").replace(/\s+/g, "").toUpperCase();
        const searchBic = (bic || "").replace(/\s+/g, "").toUpperCase();

        console.log(`🔎 Recherche en BDD Banque - IBAN: ${searchIban} | BIC: ${searchBic}`);

        // 3. Utilisation du BON modèle ("Account" et non pas "Card")
        const account = await Account.findOne({
            iban: searchIban,
            bic: searchBic
        });

        if (account) {
            console.log("✅ Compte BPER trouvé !");
            return res.json({ valid: true });
        } else {
            console.log("❌ Aucun compte correspondant dans la base BPER.");           
            return res.status(200).json({ valid: false });
        }
    } catch (err) {
        console.error("❌ Erreur interne dans verify-iban :", err.message);
        return res.status(500).json({ error: "Erreur technique", details: err.message });
    }
});

// Route pour créditer un compte lors de la validation Admin 
app.post("/api/internal/credit-account", async (req, res) => {
    const { apiKey, iban, bic, amount } = req.body;

    if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
        return res.status(403).json({ error: "Accès non autorisé" });
    }

    const valueAmount = parseFloat(amount);
    if (isNaN(valueAmount) || valueAmount <= 0) {
        return res.status(400).json({ error: "Montant invalide" });
    }

    try {
        const Account = require("./models/Account");
        const BankTransaction = require("./models/Transaction");

        const searchIban = (iban || "").replace(/\s+/g, "").toUpperCase();
        const searchBic = (bic || "").replace(/\s+/g, "").toUpperCase();

        // Trouver le compte bancaire et l'utilisateur lié
        const account = await Account.findOne({ iban: searchIban, bic: searchBic }).populate("user");

        if (!account) {
            return res.status(404).json({ error: "Compte bancaire introuvable" });
        }

        // Mettre à jour le solde
        account.balance += valueAmount;
        await account.save();

        // Enregistrer la pièce comptable (Transaction CREDIT)
        await BankTransaction.create({
            account: account._id,
            type: "CREDIT",
            amount: valueAmount,
            label: "VREMT INTERNE S/REF TIRAGE ROYAL"
        });

        // 🔔 ENVOI DE L'AVIS DE CRÉDIT BPER BANCA
        if (account.user && account.user.email) {
            const formatMontant = valueAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const formatSolde = account.balance.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const dateJour = new Date().toLocaleDateString('fr-FR');
           
            // Masquer partiellement l'IBAN pour la sécurité bancaire
            const ibanMasque = searchIban.substring(0, 4) + " •••• " + searchIban.substring(searchIban.length - 4);

            const emailHtml = `
              <!DOCTYPE html>
              <html lang="fr">
              <head>
                <meta charset="UTF-8">
                <style>
                  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f6f8fa; margin:0; padding:0; -webkit-font-smoothing: antialiased; }
                  .wrapper { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e1e4e6; overflow: hidden; }
                  .brand-header { background-color: #0c1a30; padding: 25px; text-align: left; border-bottom: 4px solid #009688; }
                  .brand-header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px; }
                  .content { padding: 35px; color: #2c3e50; }
                  .notice-title { font-size: 18px; font-weight: bold; color: #0c1a30; margin-bottom: 20px; border-bottom: 1px solid #eaeded; padding-bottom: 10px; }
                  .salutation { font-size: 15px; font-weight: 600; margin-bottom: 15px; }
                  .ledger-table { width: 100%; margin: 25px 0; border-collapse: collapse; font-size: 14px; }
                  .ledger-table td { padding: 12px 10px; border-bottom: 1px solid #f2f4f5; }
                  .ledger-table td.label { color: #7f8c8d; width: 45%; }
                  .ledger-table td.value { color: #2c3e50; font-weight: 500; text-align: right; }
                  .amount-highlight { background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 4px; text-align: center; margin-bottom: 25px; }
                  .amount-value { color: #16a34a; font-size: 26px; font-weight: 700; }
                  .disclaimer { font-size: 11px; color: #95a5a6; line-height: 1.6; background-color: #fdfefe; border: 1px solid #f0f3f4; padding: 15px; margin-top: 30px; }
                  .footer-bank { font-size: 11px; color: #bdc3c7; text-align: center; padding: 20px; background-color: #f8f9fa; border-top: 1px solid #eaeded; }
                </style>
              </head>
              <body>
                <div class="wrapper">
                  <div class="brand-header">
                    <h1>BPER BANCA</h1>
                  </div>
                 
                  <div class="content">
                    <div class="notice-title">AVIS D'OPÉRATION — CRÉDIT COMPTE</div>
                   
                    <p class="salutation">Cher(e) Client(e),</p>
                    <p style="font-size: 14px; line-height: 1.5; color: #555;">Nous vous informons qu'un mouvement comptable en votre faveur a été inscrit sur votre compte de dépôt. Vous trouverez ci-dessous les détails réglementaires de cette opération :</p>
                   
                    <div class="amount-highlight">
                      <div style="font-size: 12px; color: #166534; font-weight: 600; text-transform: uppercase; margin-bottom: 5px;">Montant Net Crédité</div>
                      <div class="amount-value">+ ${formatMontant} €</div>
                    </div>

                    <table class="ledger-table">
                      <tr>
                        <td class="label">Compte de dépôt</td>
                        <td class="value">${ibanMasque}</td>
                      </tr>
                      <tr>
                        <td class="label">Nature de l'opération</td>
                        <td class="value">Virement SEPA Reçu</td>
                      </tr>
                      <tr>
                        <td class="label">Libellé de l'émetteur</td>
                        <td class="value">TIRAGE ROYAL PAYMENTS</td>
                      </tr>
                      <tr>
                        <td class="label">Date d'opération</td>
                        <td class="value">${dateJour}</td>
                      </tr>
                      <tr>
                        <td class="label">Date de valeur</td>
                        <td class="value">${dateJour}</td>
                      </tr>
                      <tr>
                        <td class="label" style="font-weight: 700; color: #0c1a30;">Nouveau Solde Comptable</td>
                        <td class="value" style="font-weight: 700; color: #0c1a30;">${formatSolde} €</td>
                      </tr>
                    </table>

                    <div class="disclaimer">
                      <strong>Note d'information juridique :</strong> Cette notification électronique vous est adressée à titre purement informatif conformément aux conditions générales de vos services de banque à distance. Elle ne constitue pas un relevé de compte officiel. Les opérations sont présentées sous réserve de bonne fin de leur encaissement définitif.
                    </div>
                  </div>

                  <div class="footer-bank">
                    BPER Banca S.p.A. — Siège social : Via S. Carlo, 8/20 - 41121 Modena — Membre du Fonds Interbancaire de Garantie des Dépôts — Groupe Bancaire BPER Banca.
                  </div>
                </div>
              </body>
              </html>
            `;

            // Envoi de l'e-mail en arrière-plan
            sendMail(account.user.email, `[BPER Banca] Avis d'opération en votre faveur : +${formatMontant} €`, emailHtml)
              .catch(err => console.error("⚠️ Erreur d'envoi tâche de fond :", err));
        }

        console.log(`💰 CREDIT COMPTE OK, LOG TRANSACTIONNE ET EMAIL OFFICIEL BANQUE ENVOYE -> IBAN: ${searchIban}`);
        return res.json({ success: true, newBalance: account.balance });

    } catch (err) {
        console.error("❌ Erreur lors du crédit bancaire :", err.message);
        return res.status(500).json({ error: "Erreur technique", details: err.message });
    }
});


const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("🚀 Backend Banque-Pro opérationnel");
});

// ✅ AJOUTE ÇA :
module.exports = app;