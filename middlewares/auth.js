const session = require("express-session");
const jwt = require("jsonwebtoken");

// Korumalı rota (Session kontrolü)
function checkSession(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect("/");
    }
}

function checkAdminRole(req, res, next) {
    if (req.session.user && req.session.user.role_id === 2) {
        next(); // Role_id 2 ise, bir sonraki middleware veya route handler'a geç
    } else {
        res.status(403).json({ message: "Access denied." }); // Erişim reddedildi
    }
}
// Koruma middleware, JWT token'ı session'dan alır
function authenticateToken(req, res, next) {
    const token = req.session.token;

    if (!token) {
        return res
            .status(401)
            .json({ message: "Access denied. No token provided." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token." });
        req.user = user;
        next();
    });
}

module.exports = { checkSession, authenticateToken, checkAdminRole };