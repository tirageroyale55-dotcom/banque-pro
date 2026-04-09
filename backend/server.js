require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");
const cardRoutes = require("./routes/card.routes");


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

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/client", require("./routes/client.routes"));
app.use("/api/client", require("./routes/card.routes"));


app.use("/api/transactions", require("./routes/transaction.routes"));

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("🚀 Backend Banque-Pro opérationnel");
});

// ✅ AJOUTE ÇA :
module.exports = app;