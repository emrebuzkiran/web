const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { connectDB } = require("../config");
const { getFuturesAccount } = require("../services/futureServices");
const { getBalances } = require("../services/spotServices");

// Kullanıcı kaydetme işlemi
async function register(req, res) {
    try {
        const { username, mail, password, role_id } = req.body;
        const db = await connectDB();
        const usersCollection = db.collection("users");

        const existingUser = await usersCollection.findOne({ mail });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
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
}

// Kullanıcı giriş işlemi
async function login(req, res) {
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

            req.session.token = token;
            req.session.user = {
                userId: user.user_id,
                mail: user.mail,
                username: user.username,
                role_id: user.role_id,
            };

            const redirectUrl = user.role_id === 2 ? "/adminpanel" : "/anasayfa";
            return res.json({ redirectUrl });
        } else {
            res.status(400).json({ message: "Invalid password!" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error });
    }
}

async function homepage(req, res) {
    try {
        const { availableBalances, cashBalances } = await getBalances();
        const futures = await getFuturesAccount();
        res.render("anasayfa", {
            username: req.session.user.username,
            spot: {
                availableBalances,
                cashBalances,
            },
            futures,
        });
    } catch (error) {
        console.error("Error fetching balances:", error.message);
        res.render("anasayfa", {
            username: req.session.user.username,
            spot: {
                availableBalances: [],
                cashBalances: [],
            },
            futures: [],
        });
    }
}

async function adminpanel(req, res) {
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
};

async function logout(req, res) {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).send("Error destroying session");
        }
        res.redirect("/");
    });
}

module.exports = {
    register,
    login,
    homepage,
    adminpanel,
    logout,
};