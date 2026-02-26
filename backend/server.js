require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");

console.log("MONGO_URI au démarrage =", JSON.stringify(process.env.MONGO_URI));

connectDB();

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/client", require("./routes/client.routes"));
app.use("/api/transactions", require("./routes/transaction.routes"));

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("🚀 Backend Banque-Pro opérationnel");
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});