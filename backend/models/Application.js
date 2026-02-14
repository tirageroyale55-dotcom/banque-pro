// models/Application.js
import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  telephone: { type: String },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Application", applicationSchema);
