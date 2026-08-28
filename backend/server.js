/* ==========================================
   🌾 KISAN CONNECT
   server.js

   SIMPLE AUTH SYSTEM

   FEATURES:
   - Direct Signup
   - Email uniqueness check
   - Phone uniqueness check
   - Password hashing with bcrypt
   - Login system
   - Session authentication
   - CORS for Vercel frontend
   - Aiven MySQL database

   NO OTP
   NO RESEND
   NO EMAIL CONFIGURATION
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

const PORT =
    Number(process.env.PORT) || 3000;

const IS_PRODUCTION =
    process.env.NODE_ENV === "production";


/* ==========================================
   FRONTEND / CORS
========================================== */

const allowedOrigins = [

    "http://localhost:5500",

    "http://127.0.0.1:5500",

    "http://localhost:3000",

    "http://127.0.0.1:3000"

];


/* Add Vercel frontend from environment */

if (process.env.FRONTEND_URL) {

    allowedOrigins.push(
        process.env.FRONTEND_URL
            .replace(/\/$/, "")
    );
}


app.use(
    cors({

        origin: function (origin, callback) {

            // Allow requests without Origin
            // Useful for health checks and server tools

            if (!origin) {

                return callback(
                    null,
                    true
                );
            }


            if (
                allowedOrigins.includes(origin)
            ) {

                return callback(
                    null,
                    true
                );
            }


            console.log(
                "❌ CORS blocked:",
                origin
            );


            return callback(
                new Error(
                    "Not allowed by CORS"
                )
            );
        },


        credentials: true

    })
);


/* ==========================================
   BODY PARSER
========================================== */

app.use(
    express.json()
);


/* ==========================================
   SESSION CONFIGURATION
========================================== */

app.set(
    "trust proxy",
    1
);


app.use(
    session({

        secret:

            process.env.SESSION_SECRET ||

            "kisan-connect-development-secret",


        resave:
            false,


        saveUninitialized:
            false,


        cookie: {

            maxAge:

                7 *
                24 *
                60 *
                60 *
                1000,


            httpOnly:
                true,


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

const db =
    mysql.createPool({

        host:
            process.env.DB_HOST,


        port:
            Number(
                process.env.DB_PORT
            ),


        user:
            process.env.DB_USER,


        password:
            process.env.DB_PASSWORD,


        database:
            process.env.DB_NAME,


        ssl: {

            rejectUnauthorized:
                false

        },


        waitForConnections:
            true,


        connectionLimit:
            10,


        queueLimit:
            0

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

    }

    catch (error) {

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


                auth:
                    "ready"

            });

        }

        catch (error) {

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

   DEVELOPMENT / DEBUGGING
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


            return res.json(
                users
            );

        }

        catch (error) {

            console.error(
                "❌ Error getting users:",
                error.message
            );


            return res.status(500).json({

                error:
                    "Failed to get users"

            });

        }

    }
);


/* ==========================================
   DIRECT SIGNUP

   FLOW:

   1. Receive signup data
   2. Validate data
   3. Check duplicate email
   4. Check duplicate phone
   5. Hash password
   6. Create user
   7. Create login session
   8. Return user
========================================== */

app.post(
    "/api/signup",

    async (req, res) => {

        try {

            console.log(
                "📥 Direct signup request received"
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
               CLEAN VALUES
            ========================================== */

            const cleanName =
                String(name).trim();


            const cleanPhone =
                String(phone).trim();


            const normalizedEmail =
                String(email)
                    .trim()
                    .toLowerCase();


            /* ==========================================
               NAME VALIDATION
            ========================================== */

            if (
                cleanName.length < 2
            ) {

                return res.status(400).json({

                    error:
                        "Please enter a valid name"

                });

            }


            /* ==========================================
               PHONE VALIDATION
            ========================================== */

            if (
                !/^\d{10}$/.test(
                    cleanPhone
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
               ROLE VALIDATION
            ========================================== */

            const allowedRoles = [

                "Farmer",

                "Labourer",

                "Seller"

            ];


            if (
                !allowedRoles.includes(
                    role
                )
            ) {

                return res.status(400).json({

                    error:
                        "Invalid account role"

                });

            }


            /* ==========================================
               CHECK DUPLICATE EMAIL
            ========================================== */

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


            /* ==========================================
               CHECK DUPLICATE PHONE
            ========================================== */

            const [existingPhone] =
                await db.query(`

                    SELECT id

                    FROM users

                    WHERE phone = ?

                    LIMIT 1

                `, [

                    cleanPhone

                ]);


            if (
                existingPhone.length > 0
            ) {

                return res.status(409).json({

                    error:
                        "An account with this phone number already exists"

                });

            }


            /* ==========================================
               HASH PASSWORD
            ========================================== */

            const hashedPassword =
                await bcrypt.hash(

                    password,

                    10

                );


            /* ==========================================
               CREATE USER
            ========================================== */

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

                    VALUES
                    (?, ?, ?, ?, ?)

                `, [

                    cleanName,

                    cleanPhone,

                    normalizedEmail,

                    hashedPassword,

                    role

                ]);


            /* ==========================================
               USER OBJECT

               Never send password to frontend.
            ========================================== */

            const user = {

                id:
                    result.insertId,


                name:
                    cleanName,


                phone:
                    cleanPhone,


                email:
                    normalizedEmail,


                role:
                    role

            };


            /* ==========================================
               CREATE LOGIN SESSION
            ========================================== */

            req.session.user =
                user;


            await new Promise(

                (resolve, reject) => {

                    req.session.save(

                        (error) => {

                            if (error) {

                                reject(
                                    error
                                );

                            }

                            else {

                                resolve();

                            }

                        }

                    );

                }

            );


            console.log(
                `✅ New ${role} account created: ${normalizedEmail}`
            );


            /* ==========================================
               SUCCESS
            ========================================== */

            return res.status(201).json({

                success:
                    true,


                message:
                    "Account created successfully!",


                user:
                    user

            });

        }

        catch (error) {

            console.error(
                "❌ Signup error:"
            );


            console.error(
                error.message
            );


            /*
               Extra protection against
               database UNIQUE constraints.
            */

            if (
                error.code ===
                "ER_DUP_ENTRY"
            ) {

                return res.status(409).json({

                    error:
                        "Email or phone number already exists"

                });

            }


            return res.status(500).json({

                error:
                    "Could not create account"

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


            const databaseUser =
                users[0];


            /* ==========================================
               CHECK PASSWORD
            ========================================== */

            const passwordMatches =
                await bcrypt.compare(

                    password,

                    databaseUser.password

                );


            if (
                !passwordMatches
            ) {

                return res.status(401).json({

                    error:
                        "Invalid Email or Password"

                });

            }


            /* ==========================================
               SAFE USER OBJECT
            ========================================== */

            const user = {

                id:
                    databaseUser.id,


                name:
                    databaseUser.name,


                phone:
                    databaseUser.phone,


                email:
                    databaseUser.email,


                role:
                    databaseUser.role

            };


            /* ==========================================
               CREATE SESSION
            ========================================== */

            req.session.user =
                user;


            await new Promise(

                (resolve, reject) => {

                    req.session.save(

                        (error) => {

                            if (error) {

                                reject(
                                    error
                                );

                            }

                            else {

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

        }

        catch (error) {

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

        if (
            !req.session.user
        ) {

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

   DEVELOPMENT ONLY

   If ADMIN_WIPE_KEY exists,
   request must include:

   x-admin-key: YOUR_KEY
========================================== */

app.delete(
    "/api/admin/wipe-users",

    async (req, res) => {

        try {

            const configuredKey =
                process.env.ADMIN_WIPE_KEY;


            if (
                configuredKey
            ) {

                const providedKey =
                    req.headers[
                        "x-admin-key"
                    ];


                if (
                    providedKey !==
                    configuredKey
                ) {

                    return res.status(403).json({

                        success:
                            false,


                        error:
                            "Unauthorized"

                    });

                }

            }


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

        }

        catch (error) {

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

    }

);