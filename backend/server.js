/* ==========================================
   🌾 KISAN CONNECT
   server.js
   Complete Backend Server
========================================== */

const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const cors = require("cors");
const session = require("express-session");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

/* ==========================================
   SERVER CONFIGURATION
========================================== */

// Render provides PORT automatically.
// Locally it falls back to 3000.
const PORT = Number(process.env.PORT) || 3000;

const IS_PRODUCTION =
    process.env.NODE_ENV === "production";


/* ==========================================
   FRONTEND / CORS CONFIGURATION
========================================== */

const allowedOrigins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500"
];

// When frontend is hosted later, add:
// FRONTEND_URL=https://your-frontend-url
if (process.env.FRONTEND_URL) {

    allowedOrigins.push(
        process.env.FRONTEND_URL.replace(/\/$/, "")
    );
}


app.use(
    cors({

        origin: function (origin, callback) {

            // Allow requests without an Origin.
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            console.log(
                "❌ CORS blocked:",
                origin
            );

            return callback(
                new Error("Not allowed by CORS")
            );
        },

        credentials: true
    })
);


/* ==========================================
   BODY PARSER
========================================== */

app.use(express.json());


/* ==========================================
   SESSION
========================================== */

app.use(
    session({

        secret:
            process.env.SESSION_SECRET ||
            "kisan-connect-development-secret",

        resave: false,

        saveUninitialized: false,

        cookie: {

            maxAge:
                15 * 60 * 1000,

            httpOnly: true,

            secure:
                IS_PRODUCTION,

            sameSite:
                IS_PRODUCTION
                    ? "none"
                    : "lax"
        }
    })
);


/* ==========================================
   MYSQL / AIVEN DATABASE
========================================== */

const db = mysql.createPool({

    host:
        process.env.DB_HOST,

    port:
        Number(process.env.DB_PORT),

    user:
        process.env.DB_USER,

    password:
        process.env.DB_PASSWORD,

    database:
        process.env.DB_NAME,

    ssl: {

        rejectUnauthorized: false
    },

    waitForConnections: true,

    connectionLimit: 10,

    queueLimit: 0
});


/* ==========================================
   GMAIL / NODEMAILER
========================================== */

const transporter =
    nodemailer.createTransport({

        host: "smtp.gmail.com",

        port: 587,

        secure: false,

        requireTLS: true,

        auth: {

            user:
                process.env.EMAIL_USER,

            pass:
                process.env.EMAIL_APP_PASSWORD

        },

        connectionTimeout: 15000,

        greetingTimeout: 15000,

        socketTimeout: 15000

    });

/* ==========================================
   DATABASE TEST
========================================== */

async function testDatabase() {

    try {

        const connection =
            await db.getConnection();

        await connection.query(
            "SELECT 1"
        );

        connection.release();

        console.log(
            "🗄️ MySQL database connected successfully!"
        );

        return true;

    } catch (error) {

        console.error(
            "❌ MySQL connection failed:"
        );

        console.error(
            error.message
        );

        return false;
    }
}


/* ==========================================
   EMAIL TEST
========================================== */

async function testEmail() {
    try {
        console.log("📧 Testing Gmail SMTP connection...");
        console.log("📧 Gmail user configured:", !!process.env.EMAIL_USER);
        console.log(
            "📧 Gmail app password configured:",
            !!process.env.EMAIL_APP_PASSWORD
        );

        await transporter.verify();

        console.log(
            "✅ Gmail SMTP connection verified successfully!"
        );

        return true;

    } catch (error) {

        console.error(
            "❌ Gmail SMTP connection FAILED!"
        );

        console.error(
            "Error name:",
            error.name
        );

        console.error(
            "Error code:",
            error.code
        );

        console.error(
            "Error command:",
            error.command
        );

        console.error(
            "Error response:",
            error.response
        );

        console.error(
            "Error responseCode:",
            error.responseCode
        );

        console.error(
            "Error message:",
            error.message
        );

        return false;
    }
}
/* ==========================================
   HOME ROUTE
========================================== */

app.get("/", (req, res) => {

    res.json({

        status: "online",

        message:
            "🌾 Kisan Connect Backend is working!",

        environment:
            IS_PRODUCTION
                ? "production"
                : "development"
    });

});


/* ==========================================
   HEALTH CHECK
========================================== */

app.get(
    "/api/health",
    async (req, res) => {

        try {

            await db.query(
                "SELECT 1"
            );

            res.json({

                status: "healthy",

                database:
                    "connected",

                email:
                    "configured"

            });

        } catch (error) {

            console.error(
                "❌ Health check failed:",
                error.message
            );

            res.status(500).json({

                status:
                    "unhealthy",

                database:
                    "failed"

            });
        }
    }
);


/* ==========================================
   GET USERS
========================================== */

app.get(
    "/api/users",
    async (req, res) => {

        try {

            const [users] =
                await db.query(
                    `
                    SELECT
                        id,
                        name,
                        phone,
                        email,
                        role,
                        created_at
                    FROM users
                    ORDER BY id DESC
                    `
                );

            res.json(users);

        } catch (error) {

            console.error(
                "❌ Error getting users:",
                error.message
            );

            res.status(500).json({

                error:
                    "Failed to get users"

            });
        }
    }
);


/* ==========================================
   SIGNUP → REQUEST OTP
========================================== */

app.post(
    "/api/signup/request-otp",
    async (req, res) => {

        try {

            console.log(
                "📥 Signup OTP request received"
            );


            /* ==========================================
               GET DATA
            ========================================== */

            const {
                name,
                phone,
                email,
                password,
                role
            } = req.body;


            /* ==========================================
               BASIC VALIDATION
            ========================================== */

            if (
                !name ||
                !phone ||
                !email ||
                !password ||
                !role
            ) {

                return res.status(400).json({

                    error:
                        "All fields are required"

                });
            }


            /* ==========================================
               PHONE VALIDATION
            ========================================== */

            if (
                !/^\d{10}$/.test(
                    String(phone)
                )
            ) {

                return res.status(400).json({

                    error:
                        "Phone number must contain exactly 10 digits"

                });
            }


            /* ==========================================
               PASSWORD VALIDATION
            ========================================== */

            if (
                String(password).length < 6
            ) {

                return res.status(400).json({

                    error:
                        "Password should be at least 6 characters"

                });
            }


            /* ==========================================
               NORMALIZE EMAIL
            ========================================== */

            const normalizedEmail =
                String(email)
                    .trim()
                    .toLowerCase();


            /* ==========================================
               VALID ROLES
            ========================================== */

            const allowedRoles = [
                "Farmer",
                "Labourer",
                "Seller"
            ];

            if (
                !allowedRoles.includes(role)
            ) {

                return res.status(400).json({

                    error:
                        "Invalid account role"

                });
            }


            /* ==========================================
               CHECK EMAIL
            ========================================== */

            const [existingEmail] =
                await db.query(
                    `
                    SELECT id
                    FROM users
                    WHERE email = ?
                    LIMIT 1
                    `,
                    [normalizedEmail]
                );


            if (
                existingEmail.length > 0
            ) {

                return res.status(409).json({

                    error:
                        "An account with this email already exists"

                });
            }


            /* ==========================================
               CHECK PHONE
            ========================================== */

            const [existingPhone] =
                await db.query(
                    `
                    SELECT id
                    FROM users
                    WHERE phone = ?
                    LIMIT 1
                    `,
                    [phone]
                );


            if (
                existingPhone.length > 0
            ) {

                return res.status(409).json({

                    error:
                        "An account with this phone number already exists"

                });
            }


            /* ==========================================
               GENERATE OTP
            ========================================== */

            const otp =
                Math.floor(
                    100000 +
                    Math.random() * 900000
                ).toString();


            const otpExpires =
                Date.now() +
                5 * 60 * 1000;


            /* ==========================================
               HASH PASSWORD
            ========================================== */

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );


            /* ==========================================
               SAVE PENDING SIGNUP
            ========================================== */

            req.session.pendingSignup = {

                name:
                    String(name).trim(),

                phone:
                    String(phone),

                email:
                    normalizedEmail,

                password:
                    hashedPassword,

                role:
                    role,

                otp:
                    otp,

                otpExpires:
                    otpExpires
            };


            /* ==========================================
               SAVE SESSION FIRST
            ========================================== */

            await new Promise(
                (resolve, reject) => {

                    req.session.save(
                        (error) => {

                            if (error) {
                                reject(error);
                            } else {
                                resolve();
                            }

                        }
                    );

                }
            );


            /* ==========================================
               SEND EMAIL
            ========================================== */

            await transporter.sendMail({

                from:
                    `"Kisan Connect" <${process.env.EMAIL_USER}>`,

                to:
                    normalizedEmail,

                subject:
                    "🌾 Kisan Connect Email Verification",

                text:
                    `Your Kisan Connect verification code is ${otp}. This code expires in 5 minutes.`,

                html:
                    `
                    <div style="
                        font-family: Arial, sans-serif;
                        max-width: 600px;
                        margin: auto;
                        padding: 30px;
                        text-align: center;
                    ">

                        <h2>
                            🌾 Kisan Connect
                        </h2>

                        <p>
                            Your email verification code is:
                        </p>

                        <h1 style="
                            letter-spacing: 10px;
                            font-size: 38px;
                        ">
                            ${otp}
                        </h1>

                        <p>
                            This code expires in
                            <strong>5 minutes</strong>.
                        </p>

                        <p>
                            If you did not request
                            this code, ignore this email.
                        </p>

                    </div>
                    `
            });


            /* ==========================================
               SUCCESS
            ========================================== */

            console.log(
                `📧 OTP sent successfully to ${normalizedEmail}`
            );


            return res.status(200).json({

                success:
                    true,

                message:
                    "OTP sent successfully"

            });

        } catch (error) {

            console.error(
                "❌ Error sending OTP:"
            );

            console.error(
                error.message
            );


            /* ==========================================
               CLEAN PENDING SESSION ON FAILURE
            ========================================== */

            if (
                req.session &&
                req.session.pendingSignup
            ) {

                delete req.session.pendingSignup;

            }


            return res.status(500).json({

                error:
                    "Could not send verification email"

            });
        }
    }
);


/* ==========================================
   SIGNUP → VERIFY OTP
========================================== */

app.post(
    "/api/signup/verify-otp",
    async (req, res) => {

        try {

            const { otp } =
                req.body;


            const pendingSignup =
                req.session.pendingSignup;


            /* ==========================================
               CHECK SESSION
            ========================================== */

            if (!pendingSignup) {

                return res.status(400).json({

                    error:
                        "No active signup verification found. Please request a new OTP."

                });
            }


            /* ==========================================
               OTP FORMAT
            ========================================== */

            if (
                !/^\d{6}$/.test(
                    String(otp || "")
                )
            ) {

                return res.status(400).json({

                    error:
                        "Please enter a valid 6-digit OTP."

                });
            }


            /* ==========================================
               OTP EXPIRATION
            ========================================== */

            if (
                Date.now() >
                pendingSignup.otpExpires
            ) {

                delete req.session.pendingSignup;

                return res.status(400).json({

                    error:
                        "OTP has expired. Please request a new one."

                });
            }


            /* ==========================================
               OTP CHECK
            ========================================== */

            if (
                String(otp) !==
                String(pendingSignup.otp)
            ) {

                return res.status(401).json({

                    error:
                        "Incorrect OTP."

                });
            }


            /* ==========================================
               FINAL EMAIL CHECK
            ========================================== */

            const [existingEmail] =
                await db.query(
                    `
                    SELECT id
                    FROM users
                    WHERE email = ?
                    LIMIT 1
                    `,
                    [pendingSignup.email]
                );


            if (
                existingEmail.length > 0
            ) {

                delete req.session.pendingSignup;

                return res.status(409).json({

                    error:
                        "An account with this email already exists."

                });
            }


            /* ==========================================
               FINAL PHONE CHECK
            ========================================== */

            const [existingPhone] =
                await db.query(
                    `
                    SELECT id
                    FROM users
                    WHERE phone = ?
                    LIMIT 1
                    `,
                    [pendingSignup.phone]
                );


            if (
                existingPhone.length > 0
            ) {

                delete req.session.pendingSignup;

                return res.status(409).json({

                    error:
                        "An account with this phone number already exists."

                });
            }


            /* ==========================================
               CREATE USER
            ========================================== */

            const [result] =
                await db.query(
                    `
                    INSERT INTO users
                    (
                        name,
                        phone,
                        email,
                        password,
                        role
                    )
                    VALUES (?, ?, ?, ?, ?)
                    `,
                    [
                        pendingSignup.name,
                        pendingSignup.phone,
                        pendingSignup.email,
                        pendingSignup.password,
                        pendingSignup.role
                    ]
                );


            /* ==========================================
               REMOVE PENDING SIGNUP
            ========================================== */

            delete req.session.pendingSignup;


            await new Promise(
                (resolve, reject) => {

                    req.session.save(
                        (error) => {

                            if (error) {
                                reject(error);
                            } else {
                                resolve();
                            }

                        }
                    );

                }
            );


            /* ==========================================
               SUCCESS RESPONSE
            ========================================== */

            console.log(
                `✅ New ${pendingSignup.role} account created: ${pendingSignup.email}`
            );


            return res.status(201).json({

                success:
                    true,

                message:
                    "Email verified and account created successfully!",

                user: {

                    id:
                        result.insertId,

                    name:
                        pendingSignup.name,

                    phone:
                        pendingSignup.phone,

                    email:
                        pendingSignup.email,

                    role:
                        pendingSignup.role

                }

            });

        } catch (error) {

            console.error(
                "❌ OTP verification error:"
            );

            console.error(
                error.message
            );

            return res.status(500).json({

                error:
                    "Could not verify OTP"

            });
        }
    }
);


/* ==========================================
   RESEND OTP
========================================== */

app.post(
    "/api/signup/resend-otp",
    async (req, res) => {

        try {

            const pendingSignup =
                req.session.pendingSignup;


            if (!pendingSignup) {

                return res.status(400).json({

                    error:
                        "No active signup verification found."

                });
            }


            /* ==========================================
               NEW OTP
            ========================================== */

            const newOtp =
                Math.floor(
                    100000 +
                    Math.random() * 900000
                ).toString();


            const newOtpExpires =
                Date.now() +
                5 * 60 * 1000;


            pendingSignup.otp =
                newOtp;

            pendingSignup.otpExpires =
                newOtpExpires;


            /* ==========================================
               SAVE SESSION
            ========================================== */

            await new Promise(
                (resolve, reject) => {

                    req.session.save(
                        (error) => {

                            if (error) {
                                reject(error);
                            } else {
                                resolve();
                            }

                        }
                    );

                }
            );


            /* ==========================================
               SEND NEW EMAIL
            ========================================== */

            await transporter.sendMail({

                from:
                    `"Kisan Connect" <${process.env.EMAIL_USER}>`,

                to:
                    pendingSignup.email,

                subject:
                    "🌾 Kisan Connect New Verification Code",

                text:
                    `Your new Kisan Connect verification code is ${newOtp}. This code expires in 5 minutes.`,

                html:
                    `
                    <div style="
                        font-family: Arial, sans-serif;
                        max-width: 600px;
                        margin: auto;
                        padding: 30px;
                        text-align: center;
                    ">

                        <h2>
                            🌾 Kisan Connect
                        </h2>

                        <p>
                            Your new verification code is:
                        </p>

                        <h1 style="
                            letter-spacing: 10px;
                            font-size: 38px;
                        ">
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


            return res.json({

                success:
                    true,

                message:
                    "New OTP sent successfully"

            });

        } catch (error) {

            console.error(
                "❌ Error resending OTP:"
            );

            console.error(
                error.message
            );


            return res.status(500).json({

                error:
                    "Could not resend OTP"

            });
        }
    }
);


/* ==========================================
   LOGIN
========================================== */

app.post(
    "/api/login",
    async (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;


            /* ==========================================
               VALIDATION
            ========================================== */

            if (
                !email ||
                !password
            ) {

                return res.status(400).json({

                    error:
                        "Email and password are required"

                });
            }


            const normalizedEmail =
                String(email)
                    .trim()
                    .toLowerCase();


            /* ==========================================
               FIND USER
            ========================================== */

            const [users] =
                await db.query(
                    `
                    SELECT
                        id,
                        name,
                        phone,
                        email,
                        password,
                        role
                    FROM users
                    WHERE email = ?
                    LIMIT 1
                    `,
                    [normalizedEmail]
                );


            if (
                users.length === 0
            ) {

                return res.status(401).json({

                    error:
                        "Invalid Email or Password"

                });
            }


            const user =
                users[0];


            /* ==========================================
               PASSWORD CHECK
            ========================================== */

            const passwordMatches =
                await bcrypt.compare(
                    password,
                    user.password
                );


            if (!passwordMatches) {

                return res.status(401).json({

                    error:
                        "Invalid Email or Password"

                });
            }


            /* ==========================================
               REMOVE PASSWORD
            ========================================== */

            delete user.password;


            /* ==========================================
               LOGIN SESSION
            ========================================== */

            req.session.user =
                user;


            await new Promise(
                (resolve, reject) => {

                    req.session.save(
                        (error) => {

                            if (error) {
                                reject(error);
                            } else {
                                resolve();
                            }

                        }
                    );

                }
            );


            console.log(
                `🔐 Login successful: ${user.email}`
            );


            return res.json({

                success:
                    true,

                message:
                    "Login successful!",

                user:
                    user

            });

        } catch (error) {

            console.error(
                "❌ Login error:"
            );

            console.error(
                error.message
            );

            return res.status(500).json({

                error:
                    "Login failed"

            });
        }
    }
);


/* ==========================================
   CURRENT USER
========================================== */

app.get(
    "/api/me",
    (req, res) => {

        if (!req.session.user) {

            return res.status(401).json({

                error:
                    "Not logged in"

            });
        }


        return res.json({

            user:
                req.session.user

        });
    }
);


/* ==========================================
   LOGOUT
========================================== */

app.post(
    "/api/logout",
    (req, res) => {

        req.session.destroy(
            (error) => {

                if (error) {

                    console.error(
                        "❌ Logout error:",
                        error.message
                    );

                    return res.status(500).json({

                        error:
                            "Logout failed"

                    });
                }


                res.clearCookie(
                    "connect.sid"
                );


                return res.json({

                    success:
                        true,

                    message:
                        "Logged out successfully"

                });

            }
        );
    }
);


/* ==========================================
   404 ROUTE
========================================== */

app.use(
    (req, res) => {

        res.status(404).json({

            error:
                "Route not found",

            path:
                req.originalUrl

        });
    }
);


/* ==========================================
   GLOBAL ERROR HANDLER
========================================== */

app.use(
    (error, req, res, next) => {

        console.error(
            "❌ Server error:",
            error.message
        );

        res.status(500).json({

            error:
                "Internal server error"

        });
    }
);


/* ==========================================
   START SERVER
========================================== */

app.listen(
    PORT,
    async () => {

        console.log(
            `🌾 Kisan Connect Backend running on port ${PORT}`
        );

        console.log(
            `🌍 Environment: ${
                IS_PRODUCTION
                    ? "production"
                    : "development"
            }`
        );

        console.log(
            `🔗 Allowed frontend origins: ${
                allowedOrigins.join(", ")
            }`
        );


        // Test database
        await testDatabase();


        // Test Gmail
        await testEmail();

    }
);