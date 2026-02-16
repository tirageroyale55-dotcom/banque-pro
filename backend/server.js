const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");

require("dotenv").config();
connectDB();

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/client", require("./routes/client.routes"));
app.use("/api/transactions", require("./routes/transaction.routes"));

// endpoint test
app.get("/", (req, res) => {
  res.send("🚀 Backend Banque-Pro opérationnel");
});



module.exports = app;
