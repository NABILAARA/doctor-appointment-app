const express = require("express");
const multer = require("multer");
const auth = require("../middlewares/authMiddleware");
const {
  register, login, getUserData, getDoctors, applyDoctor, bookAppointment,
  getUserAppointments, cancelAppointment, getDocuments, uploadDocument,
  deleteDocument, getNotifications, markAllRead
} = require("../controllers/userController");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5*1024*1024 } });

router.post("/register", register);
router.post("/login", login);
router.post("/getuserdata", auth, getUserData);
router.get("/getalldoctors", auth, getDoctors);
router.post("/applydoctor", auth, applyDoctor);
router.post("/bookappointment", auth, bookAppointment);
router.get("/getuserappointments", auth, getUserAppointments);
router.delete("/cancelappointment/:id", auth, cancelAppointment);
router.get("/getdocs", auth, getDocuments);
router.post("/uploaddocument", auth, upload.single("document"), uploadDocument);
router.delete("/deletedocument/:id", auth, deleteDocument);
router.get("/getnotifications", auth, getNotifications);
router.post("/markallread", auth, markAllRead);

module.exports = router;
