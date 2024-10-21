// app.js
const express = require("express");
const path = require("path");
const session = require("express-session");
require("dotenv").config();
const userRoutes = require("./routes/userRoutes"); // Kullanıcı rotalarını içe aktar

const app = express();
const port = 3000;

// EJS Şablon Motoru Ayarları
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware'leri ayarla
app.use(express.json()); // JSON verisini parse et
app.use(express.urlencoded({ extended: true })); // URL encoded veriyi parse et
app.use("/public", express.static(path.join(__dirname, "public"))); // Statik dosyalar için 'public' dizinini kullan

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
    })
);

app.get("/", (req, res) => {
    res.render("login"); // login.ejs dosyasını görüntüle
});
// Rota Tanımları
app.use("/", userRoutes); // Kullanıcı rotalarını kullan

// 404 sayfasını render et
app.use((req, res) => {
    res.status(404).render("404"); // 404.ejs sayfasını render et
});

// Sunucuyu başlat
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});