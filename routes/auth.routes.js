const express = require("express");
const router = express.Router();

const { isAuthenticated } = require("../middleware/jwt.middleware.js");
const { deleteUser, login, otpVerification, signup, verifyToken } = require("../controller/auth.controller");

router.delete("/delete", isAuthenticated, deleteUser);

router.post("/signup", signup);
router.post("/otp", otpVerification);
router.post("/login", login);

router.get("/verify", isAuthenticated, verifyToken);

module.exports = router;