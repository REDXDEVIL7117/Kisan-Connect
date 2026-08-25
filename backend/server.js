/* ==========================================
   🌾 KISAN CONNECT
   server.js
   Complete Backend Server

   OTP FIX:
   Pending signup data is stored in MySQL
   instead of express-session memory.

   Email:
   Resend HTTPS API

   Database:
   Aiven MySQL
========================================== */

const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const cors = require("cors");
const session = require("express-session");

require("dotenv").config();

const app = express();

/* ==========================================
   SERVER CONFIGURATION
========================================== */

const PORT = Number(process.env.PORT) || 3000;

const IS_PRODUCTION =
    process.env.NODE_ENV === "production";


/* ==========================================
   FRONTEND / CORS
========================================== */

const allowedOrigins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500"
];

if (process.env.FRONTEND_URL) {

    allowedOrigins.push(
        process.env.FRONTEND_URL.replace(/\/$/, "")
    );
}

app.use(
    cors({

        origin: function (origin, callback) {

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

app.set("trust proxy", 1);

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
   RESEND HTTPS EMAIL API
========================================== */

async function sendEmail({
    to,
    subject,
    text,
    html
}) {

    if (!process.env.RESEND_API_KEY) {

        throw new Error(
            "RESEND_API_KEY is not configured"
        );
    }

    if (!process.env.FROM_EMAIL) {

        throw new Error(
            "RESEND_FROM_EMAIL is not configured"
        );
    }

    console.log(
        `📧 Sending email through HTTPS API to ${to}...`
    );

    const response =
        await fetch(
            "https://api.resend.com/emails",
            {

                method: "POST",

                headers: {

                    "Authorization":
                        `Bearer ${process.env.RESEND_API_KEY}`,

                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({

                        from:
                            process.env.RESEND_FROM_EMAIL,

                        to:
                            [to],

                        subject:
                            subject,

                        text:
                            text,

                        html:
                            html
                    })
            }
        );

    const responseText =
        await response.text();

    let responseData;

    try {

        responseData =
            JSON.parse(responseText);

    } catch {

        responseData =
            {
                raw:
                    responseText
            };
    }


    if (!response.ok) {

        console.error(
            "❌ Email API request failed"
        );

        console.error(
            "HTTP status:",
            response.status
        );

        console.error(
            "Response:",
            responseData
        );

        throw new Error(
            responseData?.message ||
            "Email API request failed"
        );
    }


    console.log(
        "✅ Email sent successfully through Resend"
    );

    console.log(
        "📨 Resend response:",
        responseData
    );

    return responseData;
}


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
   EMAIL CONFIGURATION TEST
========================================== */

async function testEmail() {

    console.log(
        "📧 Testing HTTPS email configuration..."
    );

    console.log(
        "📧 Resend API key configured:",
        !!process.env.RESEND_API_KEY
    );

    console.log(
        "📧 Email sender configured:",
        !!process.env.RESEND_FROM_EMAIL
    );


    if (
        process.env.RESEND_API_KEY &&
        process.env.RESEND_FROM_EMAIL
    ) {

        console.log(
            "✅ HTTPS email configuration looks ready."
        );

        return true;
    }


    console.error(
        "❌ Resend email configuration is incomplete."
    );

    return false;
}


/* ==========================================
   HOME ROUTE
========================================== */

app.get(
    "/",
    (req, res) => {

        res.json({

            status:
                "online",

            message:
                "🌾 Kisan Connect Backend is working!",

            environment:
                IS_PRODUCTION
                    ? "production"
                    : "development"
        });

    }
);


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

                status:
                    "healthy",

                database:
                    "connected",

                email:
                    process.env.RESEND_API_KEY &&
                    process.env.RESEND_FROM_EMAIL
                        ? "configured"
                        : "not configured"

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
   TEMPORARY OTP TABLE SETUP
==========================================

   USE THIS ONCE.

   After the table has been created successfully,
   REMOVE THIS ROUTE FROM server.js.
========================================== */

app.post(
    "/api/admin/setup-otp-table",
    async (req, res) => {

        try {

            console.log(
                "🛠️ Creating pending_signups table..."
            );

            await db.query(`

                CREATE TABLE IF NOT EXISTS pending_signups (

                    id INT AUTO_INCREMENT PRIMARY KEY,

                    name VARCHAR(255) NOT NULL,

                    phone VARCHAR(20) NOT NULL,

                    email VARCHAR(255) NOT NULL UNIQUE,

                    password VARCHAR(255) NOT NULL,

                    role VARCHAR(50) NOT NULL,

                    otp VARCHAR(6) NOT NULL,

                    otp_expires BIGINT NOT NULL,

                    created_at TIMESTAMP
                        DEFAULT CURRENT_TIMESTAMP

                )

            `);

            console.log(
                "✅ pending_signups table is ready!"
            );

            return res.json({

                success:
                    true,

                message:
                    "pending_signups table created successfully."

            });

        } catch (error) {

            console.error(
                "❌ Could not create OTP table:",
                error.message
            );

            return res.status(500).json({

                success:
                    false,

                error:
                    error.message

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
                await db.query(`

                    SELECT
                        id,
                        name,
                        phone,
                        email,
                        role,
                        created_at

                    FROM users

                    ORDER BY id DESC

                `);

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


            /* --------------------------------------
               GET DATA
            -------------------------------------- */

            const {
                name,
                phone,
                email,
                password,
                role
            } = req.body;


            /* --------------------------------------
               BASIC VALIDATION
            -------------------------------------- */

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


            /* --------------------------------------
               PHONE VALIDATION
            -------------------------------------- */

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


            /* --------------------------------------
               PASSWORD VALIDATION
            -------------------------------------- */

            if (
                String(password).length < 6
            ) {

                return res.status(400).json({

                    error:
                        "Password should be at least 6 characters"

                });
            }


            /* --------------------------------------
               NORMALIZE EMAIL
            -------------------------------------- */

            const normalizedEmail =
                String(email)
                    .trim()
                    .toLowerCase();


            /* --------------------------------------
               VALID ROLES
            -------------------------------------- */

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


            /* --------------------------------------
               CHECK EXISTING USER EMAIL
            -------------------------------------- */

            const [existingEmail] =
                await db.query(`

                    SELECT id

                    FROM users

                    WHERE email = ?

                    LIMIT 1

                `, [
                    normalizedEmail
                ]);


            if (
                existingEmail.length > 0
            ) {

                return res.status(409).json({

                    error:
                        "An account with this email already exists"

                });
            }


            /* --------------------------------------
               CHECK EXISTING USER PHONE
            -------------------------------------- */

            const [existingPhone] =
                await db.query(`

                    SELECT id

                    FROM users

                    WHERE phone = ?

                    LIMIT 1

                `, [
                    phone
                ]);


            if (
                existingPhone.length > 0
            ) {

                return res.status(409).json({

                    error:
                        "An account with this phone number already exists"

                });
            }


            /* --------------------------------------
               GENERATE OTP
            -------------------------------------- */

            const otp =
                Math.floor(
                    100000 +
                    Math.random() * 900000
                ).toString();


            const otpExpires =
                Date.now() +
                5 * 60 * 1000;


            /* --------------------------------------
               HASH PASSWORD
            -------------------------------------- */

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );


            /* --------------------------------------
               DELETE OLD PENDING SIGNUP
            -------------------------------------- */

            await db.query(`

                DELETE FROM pending_signups

                WHERE email = ?

            `, [
                normalizedEmail
            ]);


            /* --------------------------------------
               SAVE PENDING SIGNUP IN MYSQL
            -------------------------------------- */

            await db.query(`

                INSERT INTO pending_signups

                (
                    name,
                    phone,
                    email,
                    password,
                    role,
                    otp,
                    otp_expires
                )

                VALUES (?, ?, ?, ?, ?, ?, ?)

            `, [

                String(name).trim(),

                String(phone),

                normalizedEmail,

                hashedPassword,

                role,

                otp,

                otpExpires

            ]);


            console.log(
                `💾 Pending signup saved for ${normalizedEmail}`
            );


            /* --------------------------------------
               SEND OTP
            -------------------------------------- */

            await sendEmail({

                to:
                    normalizedEmail,

                subject:
                    "🌾 Kisan Connect Email Verification",

                text:
                    `Your Kisan Connect verification code is ${otp}. This code expires in 5 minutes.`,

                html: `

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

            const {
                otp,
                email
            } = req.body;


            /* --------------------------------------
               VALIDATE OTP
            -------------------------------------- */

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


            /* --------------------------------------
               GET EMAIL

               We accept email from the frontend.
               If frontend does not send it, we also
               try the current session as fallback.
            -------------------------------------- */

            let normalizedEmail =
                email
                    ? String(email)
                        .trim()
                        .toLowerCase()
                    : null;


            if (!normalizedEmail) {

                normalizedEmail =
                    req.session?.pendingSignup?.email ||
                    null;
            }


            if (!normalizedEmail) {

                return res.status(400).json({

                    error:
                        "Email is required to verify OTP."

                });
            }


            /* --------------------------------------
               FIND PENDING SIGNUP
            -------------------------------------- */

            const [pendingRows] =
                await db.query(`

                    SELECT

                        id,
                        name,
                        phone,
                        email,
                        password,
                        role,
                        otp,
                        otp_expires

                    FROM pending_signups

                    WHERE email = ?

                    LIMIT 1

                `, [
                    normalizedEmail
                ]);


            if (
                pendingRows.length === 0
            ) {

                return res.status(400).json({

                    error:
                        "No active signup verification found. Please request a new OTP."

                });
            }


            const pendingSignup =
                pendingRows[0];


            /* --------------------------------------
               OTP EXPIRATION
            -------------------------------------- */

            if (
                Date.now() >
                Number(
                    pendingSignup.otp_expires
                )
            ) {

                await db.query(`

                    DELETE FROM pending_signups

                    WHERE id = ?

                `, [
                    pendingSignup.id
                ]);


                return res.status(400).json({

                    error:
                        "OTP has expired. Please request a new one."

                });
            }


            /* --------------------------------------
               OTP CHECK
            -------------------------------------- */

            if (
                String(otp) !==
                String(pendingSignup.otp)
            ) {

                return res.status(401).json({

                    error:
                        "Incorrect OTP."

                });
            }


            /* --------------------------------------
               FINAL EMAIL CHECK
            -------------------------------------- */

            const [existingEmail] =
                await db.query(`

                    SELECT id

                    FROM users

                    WHERE email = ?

                    LIMIT 1

                `, [
                    pendingSignup.email
                ]);


            if (
                existingEmail.length > 0
            ) {

                await db.query(`

                    DELETE FROM pending_signups

                    WHERE id = ?

                `, [
                    pendingSignup.id
                ]);


                return res.status(409).json({

                    error:
                        "An account with this email already exists."

                });
            }


            /* --------------------------------------
               FINAL PHONE CHECK
            -------------------------------------- */

            const [existingPhone] =
                await db.query(`

                    SELECT id

                    FROM users

                    WHERE phone = ?

                    LIMIT 1

                `, [
                    pendingSignup.phone
                ]);


            if (
                existingPhone.length > 0
            ) {

                await db.query(`

                    DELETE FROM pending_signups

                    WHERE id = ?

                `, [
                    pendingSignup.id
                ]);


                return res.status(409).json({

                    error:
                        "An account with this phone number already exists."

                });
            }


            /* --------------------------------------
               CREATE USER
            -------------------------------------- */

            const [result] =
                await db.query(`

                    INSERT INTO users

                    (
                        name,
                        phone,
                        email,
                        password,
                        role
                    )

                    VALUES (?, ?, ?, ?, ?)

                `, [

                    pendingSignup.name,

                    pendingSignup.phone,

                    pendingSignup.email,

                    pendingSignup.password,

                    pendingSignup.role

                ]);


            /* --------------------------------------
               DELETE PENDING SIGNUP
            -------------------------------------- */

            await db.query(`

                DELETE FROM pending_signups

                WHERE id = ?

            `, [
                pendingSignup.id
            ]);


            /* --------------------------------------
               CREATE LOGIN SESSION
            -------------------------------------- */

            const user = {

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

            };


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
                `✅ New ${pendingSignup.role} account created: ${pendingSignup.email}`
            );


            return res.status(201).json({

                success:
                    true,

                message:
                    "Email verified and account created successfully!",

                user:
                    user

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

            const {
                email
            } = req.body;


            const normalizedEmail =
                email
                    ? String(email)
                        .trim()
                        .toLowerCase()
                    : null;


            if (!normalizedEmail) {

                return res.status(400).json({

                    error:
                        "Email is required to resend OTP."

                });
            }


            /* --------------------------------------
               FIND PENDING SIGNUP
            -------------------------------------- */

            const [pendingRows] =
                await db.query(`

                    SELECT *

                    FROM pending_signups

                    WHERE email = ?

                    LIMIT 1

                `, [
                    normalizedEmail
                ]);


            if (
                pendingRows.length === 0
            ) {

                return res.status(400).json({

                    error:
                        "No active signup verification found. Please request a new OTP."

                });
            }


            const pendingSignup =
                pendingRows[0];


            /* --------------------------------------
               GENERATE NEW OTP
            -------------------------------------- */

            const newOtp =
                Math.floor(
                    100000 +
                    Math.random() * 900000
                ).toString();


            const newOtpExpires =
                Date.now() +
                5 * 60 * 1000;


            /* --------------------------------------
               UPDATE MYSQL
            -------------------------------------- */

            await db.query(`

                UPDATE pending_signups

                SET
                    otp = ?,
                    otp_expires = ?

                WHERE id = ?

            `, [

                newOtp,

                newOtpExpires,

                pendingSignup.id

            ]);


            /* --------------------------------------
               SEND NEW OTP
            -------------------------------------- */

            await sendEmail({

                to:
                    pendingSignup.email,

                subject:
                    "🌾 Kisan Connect New Verification Code",

                text:
                    `Your new Kisan Connect verification code is ${newOtp}. This code expires in 5 minutes.`,

                html: `

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


            const [users] =
                await db.query(`

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

                `, [
                    normalizedEmail
                ]);


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


            delete user.password;


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
                "❌ Login error:",
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
   ADMIN WIPE USERS
==========================================

   DEMO / DEVELOPMENT USE ONLY.

   IMPORTANT:
   Remove this endpoint before public release.
========================================== */

app.delete(
    "/api/admin/wipe-users",
    async (req, res) => {

        try {

            await db.query(
                "DELETE FROM users"
            );

            console.log(
                "🧨 ALL USERS DELETED FROM DATABASE"
            );

            return res.json({

                success:
                    true,

                message:
                    "All users have been deleted."

            });

        } catch (error) {

            console.error(
                "❌ Failed to wipe users:",
                error.message
            );

            return res.status(500).json({

                success:
                    false,

                error:
                    "Could not delete users."

            });
        }
    }
);


/* ==========================================
   404
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


        await testDatabase();

        await testEmail();

    }
);