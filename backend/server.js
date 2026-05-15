require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");
const cardRoutes = require("./routes/card.routes");
const cardRequestRoutes = require("./routes/cardRequest.route");

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
        
        const Account = require("../models/Account");
       
        const account = await Card.findOne({
            iban: iban.replace(/\s+/g, ""),
            bic: bic.trim()
        });

        if (account) {
            return res.json({ valid: true });
        } else {
            return res.status(404).json({ valid: false });
        }
    } catch (err) {
        res.status(500).json({ error: "Erreur technique" });
    }
});

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("🚀 Backend Banque-Pro opérationnel");
});

// ✅ AJOUTE ÇA :
module.exports = app;