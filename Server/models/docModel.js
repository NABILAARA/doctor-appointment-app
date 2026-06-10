const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  specialization: { type: String, required: true },
  experience: { type: String, required: true },
  fees: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  timings: { type: String, default: '09:00 - 17:00' }
}, { timestamps: true });

module.exports = mongoose.model("doctor", doctorSchema);
