const doctorModel = require("../models/docModel");
const userModel = require("../models/userModel");
const appointmentModel = require("../models/appointmentModel");

const getAllDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find();
    res.json({ success: true, data: doctors });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

const approveDoctor = async (req, res) => {
  try {
    const { doctorId, userId } = req.body;
    
    // Update doctor status
    await doctorModel.findByIdAndUpdate(doctorId, { status: "approved" });
    await userModel.findByIdAndUpdate(userId, { isdoctor: true });
    
    // Add notification to doctor
    const doctorUser = await userModel.findById(userId);
    if (doctorUser) {
      doctorUser.notification = doctorUser.notification || [];
      doctorUser.notification.push({
        message: "🎉 Congratulations! Your doctor application has been approved! You can now receive appointments.",
        type: "approval",
        date: new Date()
      });
      await doctorUser.save();
      console.log("Notification sent to doctor:", doctorUser.email);
    }
    
    // Also add notification to all patients (optional - to show new doctor available)
    const patients = await userModel.find({ type: "user", isdoctor: false });
    for (const patient of patients) {
      patient.notification = patient.notification || [];
      patient.notification.push({
        message: `✨ New doctor available: Dr. ${doctorUser?.fullName || "New Doctor"} has joined MediCareBook!`,
        type: "new_doctor",
        date: new Date()
      });
      await patient.save();
    }
    
    res.json({ success: true, message: "Doctor approved" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: err.message });
  }
};
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().select("-password");
    res.json({ success: true, data: users });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

const getAllAppointments = async (req, res) => {
  try {
    const appointments = await appointmentModel.find();
    res.json({ success: true, data: appointments });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

module.exports = { getAllDoctors, approveDoctor, getAllUsers, getAllAppointments };
