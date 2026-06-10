const express = require("express");
const auth = require("../middlewares/authMiddleware");
const { getAllDoctors, approveDoctor, getAllUsers, getAllAppointments } = require("../controllers/adminController");

const router = express.Router();

router.get("/getalldoctors", auth, getAllDoctors);
router.post("/approvedoctor", auth, approveDoctor);
router.get("/getallusers", auth, getAllUsers);
router.get("/getallappointments", auth, getAllAppointments);

module.exports = router;
