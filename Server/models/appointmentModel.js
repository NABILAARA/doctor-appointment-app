const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "doctor", required: true },
  userInfo: { type: Object, required: true },
  doctorInfo: { type: Object, required: true },
  date: { type: String, required: true },
  document: { type: Object, default: null },
  status: { type: String, default: "pending" }
}, { timestamps: true });

module.exports = mongoose.model("appointment", appointmentSchema);
