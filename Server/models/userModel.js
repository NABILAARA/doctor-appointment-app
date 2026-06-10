const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  isdoctor: { type: Boolean, default: false },
  type: { type: String, default: "user" },
  notification: { type: Array, default: [] },
  seennotification: { type: Array, default: [] },
  documents: { type: Array, default: [] }
}, { timestamps: true });

module.exports = mongoose.model("user", userSchema);
