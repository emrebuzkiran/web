// app.js
const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { connectDB } = require("./config");
const session = require("express-session");
require("dotenv").config();
const { Client } = require("binance-api-node");
const { DateTime } = require("luxon");
const { getFuturesAccount } = require("./services/futureServices");
const { getBalances } = require("./services/spotServices");


const app = express();
const port = 3000;

// EJS Şablon Motoru Ayarları
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // 'views' klasörünü ayarla

app.use(express.json()); // JSON verisini parse et
app.use(express.urlencoded({ extended: true })); // URL encoded veriyi parse et
app.use("/public", express.static(path.join(__dirname, "public"))); // Statik dosyalar için 'public' dizinini kullan

// Session middleware ayarları
app.use(
    session({
        secret: process.env.SESSION_SECRET, // Ortam değişkeninden alınan gizli anahtar
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, // HTTPS kullanıyorsanız true yapmalısınız
    })
);

// Korumalı rota (Session kontrolü)
function checkSession(req, res, next) {
    if (req.session.user) {
        next(); // Oturum varsa, bir sonraki middleware veya route handler'a geç
    } else {
        res.redirect("/"); // Oturum yoksa login sayfasına yönlendir
    }
}

// '/' adresinde login.ejs'i göster
app.get("/", (req, res) => {
    res.render("login"); // login.ejs dosyasını görüntüle
});

// '/anasayfa' adresine gitme (session kontrolü)
app.get("/anasayfa", checkSession, async(req, res) => {
    try {
        const { availableBalances, cashBalances } = await getBalances(); // Get spot balances
        const futures = await getFuturesAccount(); // Get futures account data
        res.render("anasayfa", {
            username: req.session.user.username,
            spot: {
                availableBalances,
                cashBalances,
            },
            futures, // Send structured data to the template
        });
    } catch (error) {
        console.error("Error fetching balances:", error.message);
        res.render("anasayfa", {
            username: req.session.user.username,
            spot: {
                availableBalances: [],
                cashBalances: [],
            },
            futures: [], // Send empty array on error
        });
    }
});


app.get("/adminpanel", checkSession, checkAdminRole, async(req, res) => {
    try {
        const db = await connectDB();
        const usersCollection = db.collection("users");

        // Tüm kullanıcıları getirin
        const users = await usersCollection
            .find({}, { projection: { user_id: 1, username: 1, mail: 1, role_id: 1 } })
            .toArray();

        // Admin panel şablonuna kullanıcı verileri ile birlikte gönder
        return res.render("adminpanel", {
            username: req.session.user.username,
            users,
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).send("Error fetching users");
    }
});


function checkAdminRole(req, res, next) {
    if (req.session.user && req.session.user.role_id === 2) {
        next(); // Role_id 2 ise, bir sonraki middleware veya route handler'a geç
    } else {
        res.status(403).json({ message: "Access denied." }); // Erişim reddedildi
    }
}





// '/register' adresine POST isteği ile kullanıcı kaydetme
app.post("/register", async(req, res) => {
    try {
        const { username, mail, password, role_id } = req.body;
        const db = await connectDB();
        const usersCollection = db.collection("users");

        // Kullanıcı daha önce var mı kontrol et
        const existingUser = await usersCollection.findOne({ mail });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists!" });
        }

        // Şifreyi hash'le
        const hashedPassword = await bcrypt.hash(password, 10);

        // Yeni kullanıcıyı ekle
        const newUser = {
            user_id: Date.now(),
            username,
            mail,
            password: hashedPassword,
            role_id,
        };
        await usersCollection.insertOne(newUser);
        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error registering user", error });
    }
});

// '/login' adresine POST isteği ile kullanıcı giriş yapma
app.post("/login", async(req, res) => {
    try {
        const { mail, password } = req.body;
        const db = await connectDB();
        const usersCollection = db.collection("users");

        const user = await usersCollection.findOne({ mail });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const token = jwt.sign({ userId: user.user_id, mail: user.mail },
                process.env.JWT_SECRET, { expiresIn: "1h" }
            );

            // Session'da JWT token'ı sakla ve kullanıcı bilgilerini ekle
            req.session.token = token;
            req.session.user = {
                userId: user.user_id,
                mail: user.mail,
                username: user.username,
                role_id: user.role_id,
            };

            // Şablon dosyasına kullanıcı bilgilerini göndererek render et
            const redirectUrl = user.role_id === 2 ? "/adminpanel" : "/anasayfa";
            return res.json({ redirectUrl }); // Yanıtı döndür
        } else {
            res.status(400).json({ message: "Invalid password!" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error });
    }
});


// Koruma middleware, JWT token'ı session'dan alır
function authenticateToken(req, res, next) {
    const token = req.session.token; // Session'dan token al

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

// Çıkış yapma işlemi
app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Error logging out", err });
        }
        res.redirect("/"); // Giriş sayfasına yönlendir
    });
});

app.use((req, res, next) => {
    res.status(404).render("404"); // 404.ejs sayfasını render et
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});