const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const doctorModel = require("../models/docModel");
const appointmentModel = require("../models/appointmentModel");
const fs = require("fs");
const path = require("path");

// Register
const register = async (req, res) => {
  try {
    const exists = await userModel.findOne({ email: req.body.email });
    if (exists) return res.json({ message: "Email already exists", success: false });
    const hashed = await bcrypt.hash(req.body.password, 10);
    const user = new userModel({ ...req.body, password: hashed });
    await user.save();
    res.json({ message: "Registration successful", success: true });
  } catch (err) {
    res.json({ message: err.message, success: false });
  }
};

// Login
const login = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) return res.json({ message: "User not found", success: false });
    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) return res.json({ message: "Wrong password", success: false });
    const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, { expiresIn: "7d" });
    user.password = undefined;
    res.json({ message: "Login success", success: true, token, user });
  } catch (err) {
    res.json({ message: err.message, success: false });
  }
};

// Get user data
const getUserData = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("-password");
    res.json({ success: true, data: user });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// Get all approved doctors
const getDoctors = async (req, res) => {
  try {
    console.log("=== GET DOCTORS ===");
    const doctors = await doctorModel.find({ status: "approved" });
    console.log("Approved doctors found:", doctors.length);
    res.json({ success: true, data: doctors });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: err.message });
  }
};

// Apply as doctor
const applyDoctor = async (req, res) => {
  try {
    const existing = await doctorModel.findOne({ userId: req.userId });
    if (existing) return res.json({ success: false, message: "You already applied" });
    
    const doctor = new doctorModel({ ...req.body.doctor, userId: req.userId });
    await doctor.save();
    
    // Add notification to admin
    const admin = await userModel.findOne({ type: "admin" });
    if (admin) {
      admin.notification.push({
        message: `New doctor application from ${req.body.doctor.fullName}`,
        type: "doctor_apply",
        date: new Date()
      });
      await admin.save();
    }
    
    res.json({ success: true, message: "Application submitted" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// Book appointment
const bookAppointment = async (req, res) => {
  try {
    const apt = new appointmentModel(req.body);
    await apt.save();
    
    // Add notification to doctor
    const doctor = await doctorModel.findById(req.body.doctorId);
    const doctorUser = await userModel.findById(doctor.userId);
    if (doctorUser) {
      doctorUser.notification.push({
        message: `New appointment request from ${req.body.userInfo.fullName}`,
        type: "new_appointment",
        date: new Date()
      });
      await doctorUser.save();
    }
    
    res.json({ success: true, message: "Appointment booked" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// Get user appointments
const getUserAppointments = async (req, res) => {
  try {
    const apts = await appointmentModel.find({ userId: req.userId });
    res.json({ success: true, data: apts });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    await appointmentModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Appointment cancelled" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// Get user documents
const getDocuments = async (req, res) => {
  try {
    console.log("=== GET DOCUMENTS ===");
    const user = await userModel.findById(req.userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    
    console.log("Documents in DB:", JSON.stringify(user.documents, null, 2));
    res.json({ success: true, data: user.documents || [] });
  } catch (err) {
    console.error("Error:", err);
    res.json({ success: false, message: err.message });
  }
};

// Upload document
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.json({ success: false, message: "No file" });
    
    // Create secure_uploads folder if not exists
    const uploadDir = path.join(__dirname, "../secure_uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const newName = Date.now() + '-' + Math.random().toString(36).substring(7) + '-' + req.file.originalname;
    const filePath = path.join(uploadDir, newName);
    fs.writeFileSync(filePath, req.file.buffer);
    
    const user = await userModel.findById(req.userId);
    const newDoc = {
      name: req.file.originalname,
      storedName: newName,
      size: req.file.size,
      uploadedAt: new Date()
    };
    user.documents.push(newDoc);
    await user.save();
    
    res.json({ success: true, message: "Uploaded", data: newDoc });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: err.message });
  }
};

// Delete document
const deleteDocument = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    const docIndex = user.documents.findIndex(d => d._id.toString() === req.params.id);
    if (docIndex !== -1) {
      const doc = user.documents[docIndex];
      const filePath = path.join(__dirname, "../secure_uploads", doc.storedName);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      user.documents.splice(docIndex, 1);
      await user.save();
    }
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// Get notifications
const getNotifications = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    res.json({ success: true, data: { 
      notification: user.notification || [], 
      seennotification: user.seennotification || [] 
    } });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// Mark all notifications read
const markAllRead = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    user.seennotification.push(...user.notification);
    user.notification = [];
    await user.save();
    res.json({ success: true, message: "Marked as read" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

module.exports = {
  register, login, getUserData, getDoctors, applyDoctor, bookAppointment,
  getUserAppointments, cancelAppointment, getDocuments, uploadDocument,
  deleteDocument, getNotifications, markAllRead
};
