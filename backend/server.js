/* ==========================================
   KISAN CONNECT
   BACKEND SERVER
========================================== */

const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const cors = require("cors");
const session = require("express-session");
const nodemailer = require("nodemailer");

require("dotenv").config();

const app = express();

const PORT = 3000;

// ==========================================
// CORS
// ==========================================

app.use(
    cors({
        origin: [
            "http://127.0.0.1:5500",
            "http://localhost:5500"
        ],
        credentials: true
    })
);

// Allow JSON requests
app.use(express.json());

// ==========================================
// SESSION
// ==========================================

app.use(
    session({
        secret: process.env.SESSION_SECRET || "kisan-connect-development-secret",

        resave: false,

        saveUninitialized: false,

        cookie: {
            maxAge: 15 * 60 * 1000,
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        }
    })
);

// ==========================================
// MYSQL DATABASE CONNECTION
// ==========================================

const db = mysql.createPool({

    host: process.env.DB_HOST,

    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD,

    database: process.env.DB_NAME,

    port: Number(process.env.DB_PORT),

    waitForConnections: true,

    connectionLimit: 10,

    queueLimit: 0
});

// ==========================================
// EMAIL TRANSPORTER
// ==========================================

const transporter = nodemailer.createTransport({

    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,

        pass: process.env.EMAIL_APP_PASSWORD
    }

});

// ==========================================
// TEST EMAIL CONFIGURATION
// ==========================================

async function testEmail() {

    try {

        await transporter.verify();

        console.log("📧 Gmail email system connected successfully!");

    } catch (error) {

        console.error("❌ Gmail email system connection failed!");

        console.error(error.message);

    }

}

// ==========================================
// TEST DATABASE CONNECTION
// ==========================================

async function testDatabase() {

    try {

        const connection = await db.getConnection();

        console.log("🗄️ MySQL database connected successfully!");

        connection.release();

    } catch (error) {

        console.error("❌ MySQL connection failed!");

        console.error(error.message);

    }

}

// ==========================================
// BASIC BACKEND ROUTE
// ==========================================

app.get("/", (req, res) => {

    res.json({

        message: "🌾 Kisan Connect Backend is working!"

    });

});

// ==========================================
// GET ALL USERS
// ==========================================

app.get("/api/users", async (req, res) => {

    try {

        // Password is intentionally NOT included

        const [users] = await db.query(

            "SELECT id, name, phone, email, role, created_at FROM users"

        );

        res.json(users);

    } catch (error) {

        console.error("❌ Error getting users:", error.message);

        res.status(500).json({

            error: "Failed to get users"

        });

    }

});

// ==========================================
// REQUEST SIGNUP OTP
// ==========================================

app.post("/api/signup/request-otp", async (req, res) => {

    try {

        const {
            name,
            phone,
            email,
            password,
            role
        } = req.body;

        // ------------------------------
        // VALIDATION
        // ------------------------------

        if (
            !name ||
            !phone ||
            !email ||
            !password ||
            !role
        ) {

            return res.status(400).json({

                error: "All fields are required"

            });

        }

        // ------------------------------
        // CHECK PHONE
        // ------------------------------

        if (
            phone.length !== 10 ||
            !/^\d{10}$/.test(phone)
        ) {

            return res.status(400).json({

                error: "Phone number must contain exactly 10 digits"

            });

        }

        // ------------------------------
        // CHECK PASSWORD
        // ------------------------------

        if (password.length < 6) {

            return res.status(400).json({

                error: "Password should be at least 6 characters"

            });

        }

        // ------------------------------
        // CHECK EMAIL
        // ------------------------------

        const normalizedEmail = email
            .trim()
            .toLowerCase();

        // ------------------------------
        // CHECK EXISTING USER
        // ------------------------------

        const [existingUsers] = await db.query(

            "SELECT id FROM users WHERE email = ?",

            [normalizedEmail]

        );

        if (existingUsers.length > 0) {

            return res.status(409).json({

                error: "An account with this email already exists"

            });

        }

        // ------------------------------
        // GENERATE OTP
        // ------------------------------

        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        // OTP expires after 5 minutes

        const otpExpires = Date.now() + (5 * 60 * 1000);

        // ------------------------------
        // STORE PENDING SIGNUP
        // ------------------------------

        req.session.pendingSignup = {

            name,

            phone,

            email: normalizedEmail,

            password,

            role,

            otp,

            otpExpires

        };

        // ------------------------------
        // SEND EMAIL
        // ------------------------------

        await transporter.sendMail({

            from: `"Kisan Connect" <${process.env.EMAIL_USER}>`,

            to: normalizedEmail,

            subject: "🌾 Kisan Connect Email Verification",

            text:
                `Your Kisan Connect verification code is: ${otp}\n\n` +
                `This code expires in 5 minutes.\n\n` +
                `If you did not request this code, you can ignore this email.`,

            html: `

                <div style="font-family: Arial, sans-serif;">

                    <h2>🌾 Kisan Connect</h2>

                    <p>Your email verification code is:</p>

                    <h1 style="letter-spacing: 8px;">
                        ${otp}
                    </h1>

                    <p>
                        This code expires in <strong>5 minutes</strong>.
                    </p>

                    <p>
                        If you did not request this code,
                        you can ignore this email.
                    </p>

                </div>

            `

        });

       console.log(
    `📧 OTP sent to ${normalizedEmail}`
);

// Make sure the OTP session is saved
// before the response reaches the browser.
req.session.save((sessionError) => {

    if (sessionError) {

        console.error(
            "❌ Could not save OTP session:",
            sessionError.message
        );

        return res.status(500).json({

            error: "Could not save verification session"

        });

    }

    res.json({

        message: "OTP sent successfully"

    });

});

    } catch (error) {

        console.error(
            "❌ Error sending OTP:",
            error.message
        );

        res.status(500).json({

            error: "Could not send verification email"

        });

    }

});

// ==========================================
// VERIFY SIGNUP OTP
// ==========================================

app.post("/api/signup/verify-otp", async (req, res) => {

    try {

        const { otp } = req.body;
console.log("🔐 VERIFY SESSION:", req.session);

console.log(
    "🔐 PENDING SIGNUP:",
    req.session.pendingSignup
);
        // ------------------------------
        // CHECK SESSION
        // ------------------------------

        const pendingSignup =
            req.session.pendingSignup;

        if (!pendingSignup) {

            return res.status(400).json({

                error: "No signup verification is currently active"

            });

        }

        // ------------------------------
        // CHECK OTP FORMAT
        // ------------------------------

        if (
            !otp ||
            !/^\d{6}$/.test(otp)
        ) {

            return res.status(400).json({

                error: "Please enter a valid 6-digit OTP"

            });

        }

        // ------------------------------
        // CHECK EXPIRATION
        // ------------------------------

        if (
            Date.now() >
            pendingSignup.otpExpires
        ) {

            req.session.pendingSignup = null;

            return res.status(400).json({

                error: "OTP has expired. Please request a new one"

            });

        }

        // ------------------------------
        // CHECK OTP
        // ------------------------------

        if (otp !== pendingSignup.otp) {

            return res.status(401).json({

                error: "Incorrect OTP"

            });

        }

        // ------------------------------
        // CHECK EMAIL AGAIN
        // ------------------------------

        const [existingUsers] = await db.query(

            "SELECT id FROM users WHERE email = ?",

            [pendingSignup.email]

        );

        if (existingUsers.length > 0) {

            req.session.pendingSignup = null;

            return res.status(409).json({

                error: "An account with this email already exists"

            });

        }

        // ------------------------------
        // HASH PASSWORD
        // ------------------------------

        const hashedPassword =
            await bcrypt.hash(
                pendingSignup.password,
                10
            );

        // ------------------------------
        // CREATE ACCOUNT
        // ------------------------------

        const [result] = await db.query(

            `INSERT INTO users
            (name, phone, email, password, role)
            VALUES (?, ?, ?, ?, ?)`,

            [
                pendingSignup.name,

                pendingSignup.phone,

                pendingSignup.email,

                hashedPassword,

                pendingSignup.role
            ]

        );

        // ------------------------------
        // REMOVE PENDING SIGNUP
        // ------------------------------

        req.session.pendingSignup = null;

        // ------------------------------
        // SUCCESS
        // ------------------------------

        res.status(201).json({

            message:
                "🎉 Email verified and account created successfully!",

            user: {

                id: result.insertId,

                name: pendingSignup.name,

                phone: pendingSignup.phone,

                email: pendingSignup.email,

                role: pendingSignup.role

            }

        });

    } catch (error) {

        console.error(
            "❌ OTP verification error:",
            error.message
        );

        res.status(500).json({

            error: "Could not verify OTP"

        });

    }

});

// ==========================================
// RESEND SIGNUP OTP
// ==========================================

app.post("/api/signup/resend-otp", async (req, res) => {

    try {

        const pendingSignup =
            req.session.pendingSignup;

        if (!pendingSignup) {

            return res.status(400).json({

                error: "No signup verification is currently active"

            });

        }

        // ------------------------------
        // GENERATE NEW OTP
        // ------------------------------

        const newOtp = Math.floor(

            100000 +
            Math.random() * 900000

        ).toString();

        const newOtpExpires =
            Date.now() + (5 * 60 * 1000);

        // ------------------------------
        // UPDATE SESSION
        // ------------------------------

        pendingSignup.otp = newOtp;

        pendingSignup.otpExpires =
            newOtpExpires;

        // ------------------------------
        // SEND NEW EMAIL
        // ------------------------------

        await transporter.sendMail({

            from:
                `"Kisan Connect" <${process.env.EMAIL_USER}>`,

            to: pendingSignup.email,

            subject:
                "🌾 Kisan Connect New Verification Code",

            text:
                `Your new Kisan Connect verification code is: ${newOtp}\n\n` +
                `This code expires in 5 minutes.`,

            html: `

                <div style="font-family: Arial, sans-serif;">

                    <h2>🌾 Kisan Connect</h2>

                    <p>Your new verification code is:</p>

                    <h1 style="letter-spacing: 8px;">
                        ${newOtp}
                    </h1>

                    <p>
                        This code expires in
                        <strong>5 minutes</strong>.
                    </p>

                </div>

            `

        });

        console.log(
            `📧 New OTP sent to ${pendingSignup.email}`
        );

        res.json({

            message: "New OTP sent successfully"

        });

    } catch (error) {

        console.error(
            "❌ Error resending OTP:",
            error.message
        );

        res.status(500).json({

            error: "Could not resend OTP"

        });

    }

});

// ==========================================
// USER LOGIN
// ==========================================

app.post("/api/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        // ------------------------------
        // VALIDATION
        // ------------------------------

        if (!email || !password) {

            return res.status(400).json({

                error:
                    "Email and password are required"

            });

        }

        // ------------------------------
        // FIND USER
        // ------------------------------

        const [users] = await db.query(

            `SELECT
                id,
                name,
                phone,
                email,
                password,
                role
             FROM users
             WHERE email = ?`,

            [email.trim().toLowerCase()]

        );

        if (users.length === 0) {

            return res.status(401).json({

                error:
                    "Invalid Email or Password"

            });

        }

        const user = users[0];

        // ------------------------------
        // CHECK PASSWORD
        // ------------------------------

        const passwordMatch =
            await bcrypt.compare(

                password,

                user.password

            );

        if (!passwordMatch) {

            return res.status(401).json({

                error:
                    "Invalid Email or Password"

            });

        }

        // Never send password to browser

        delete user.password;

        // ------------------------------
        // LOGIN SUCCESS
        // ------------------------------

        res.json({

            message:
                "Login successful!",

            user

        });

    } catch (error) {

        console.error(
            "❌ Login error:",
            error.message
        );

        res.status(500).json({

            error: "Login failed"

        });

    }

});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, async () => {

    console.log(

        `🌾 Kisan Connect Backend running at http://localhost:${PORT}`

    );

    await testDatabase();

    await testEmail();

});