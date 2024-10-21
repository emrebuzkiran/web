const express = require("express");
const router = express.Router();
const { register, login, homepage, adminpanel, logout } = require("../controllers/userController");
const {
    checkSession,
    checkAdminRole,
} = require("../middlewares/auth");

// Kullanıcı kayıt işlemi
router.post("/register", register);

// Kullanıcı giriş işlemi
router.post("/login", login);

// Anasayfa
router.get("/anasayfa", checkSession, homepage);

// Admin panel
router.get("/adminpanel", checkSession, checkAdminRole, adminpanel);

router.post("/logout", logout);

module.exports = router;