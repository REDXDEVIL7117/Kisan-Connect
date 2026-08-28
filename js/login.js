/* ==========================================
   🌾 KISAN CONNECT
   login.js

   Simple Authentication System

   Features:
   - Direct signup
   - Unique email check
   - Unique phone check
   - Secure password hashing handled by backend
   - Login
   - Session support
   - Role-based dashboard redirect
========================================== */


/* ==========================================
   API CONFIGURATION
========================================== */

const API_URL =
    "https://kisan-connect-backend.onrender.com";


/* ==========================================
   SIGNUP SYSTEM
========================================== */

const signupForm =
    document.getElementById("signupForm");


if (signupForm) {

    signupForm.addEventListener(
        "submit",
        async function (e) {

            // Stop normal form submission
            e.preventDefault();


            /* ==========================================
               GET FORM VALUES
            ========================================== */

            const name =
                document
                    .getElementById("name")
                    .value
                    .trim();

            const phone =
                document
                    .getElementById("phone")
                    .value
                    .trim();

            const email =
                document
                    .getElementById("email")
                    .value
                    .trim()
                    .toLowerCase();

            const password =
                document
                    .getElementById("password")
                    .value;

            const confirmPassword =
                document
                    .getElementById("confirmPassword")
                    .value;

            const role =
                document
                    .getElementById("role")
                    .value;


            /* ==========================================
               VALIDATION
            ========================================== */

            if (
                !name ||
                !phone ||
                !email ||
                !password ||
                !confirmPassword ||
                !role
            ) {

                alert(
                    "Please fill all fields."
                );

                return;
            }


            // Phone validation
            if (!/^\d{10}$/.test(phone)) {

                alert(
                    "Phone number must contain exactly 10 digits."
                );

                return;
            }


            // Password validation
            if (password.length < 6) {

                alert(
                    "Password should be at least 6 characters."
                );

                return;
            }


            // Confirm password
            if (password !== confirmPassword) {

                alert(
                    "Passwords do not match."
                );

                return;
            }


            /* ==========================================
               SIGNUP BUTTON
            ========================================== */

            const signupBtn =
                document.getElementById("signupBtn");

            const originalText =
                signupBtn.textContent;

            signupBtn.disabled = true;

            signupBtn.textContent =
                "Creating Account...";


            /* ==========================================
               SEND SIGNUP REQUEST
            ========================================== */

            try {

                console.log(
                    "🚀 Creating new account..."
                );


                const response =
                    await fetch(
                        `${API_URL}/api/signup`,
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            credentials: "include",

                            body:
                                JSON.stringify({

                                    name,
                                    phone,
                                    email,
                                    password,
                                    role

                                })

                        }
                    );


                const data =
                    await response.json();


                /* ==========================================
                   BACKEND ERROR
                ========================================== */

                if (!response.ok) {

                    console.error(
                        "❌ Signup error:",
                        data
                    );

                    alert(
                        data.error ||
                        "Could not create account."
                    );

                    signupBtn.disabled = false;

                    signupBtn.textContent =
                        originalText;

                    return;
                }


                /* ==========================================
                   SAVE USER
                ========================================== */

                localStorage.setItem(
                    "currentUser",
                    JSON.stringify(data.user)
                );


                console.log(
                    "✅ Account created:",
                    data.user
                );


                alert(
                    "🎉 Account created successfully! Welcome " +
                    data.user.name +
                    "!"
                );


                /* ==========================================
                   ROLE REDIRECT
                ========================================== */

                redirectUserByRole(
                    data.user
                );

            }

            catch (error) {

                console.error(
                    "❌ Signup request failed:",
                    error
                );

                alert(
                    "❌ Could not connect to Kisan Connect server."
                );

                signupBtn.disabled = false;

                signupBtn.textContent =
                    originalText;

            }

        }
    );

}


/* ==========================================
   LOGIN SYSTEM
========================================== */

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (e) {

            // Stop normal form submission
            e.preventDefault();


            /* ==========================================
               GET LOGIN VALUES
            ========================================== */

            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim()
                    .toLowerCase();

            const password =
                document
                    .getElementById("loginPassword")
                    .value;


            /* ==========================================
               VALIDATION
            ========================================== */

            if (!email || !password) {

                alert(
                    "Please enter your email and password."
                );

                return;
            }


            /* ==========================================
               LOGIN BUTTON
            ========================================== */

            const loginBtn =
                document.getElementById("loginBtn");

            const originalText =
                loginBtn
                    ? loginBtn.textContent
                    : "Login";


            if (loginBtn) {

                loginBtn.disabled = true;

                loginBtn.textContent =
                    "Logging in...";

            }


            /* ==========================================
               LOGIN REQUEST
            ========================================== */

            try {

                console.log(
                    "🔐 Attempting login..."
                );


                const response =
                    await fetch(
                        `${API_URL}/api/login`,
                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            credentials:
                                "include",

                            body:
                                JSON.stringify({

                                    email,
                                    password

                                })

                        }
                    );


                const data =
                    await response.json();


                /* ==========================================
                   LOGIN ERROR
                ========================================== */

                if (!response.ok) {

                    alert(
                        data.error ||
                        "Invalid Email or Password."
                    );


                    if (loginBtn) {

                        loginBtn.disabled =
                            false;

                        loginBtn.textContent =
                            originalText;

                    }

                    return;
                }


                /* ==========================================
                   SAVE USER
                ========================================== */

                localStorage.setItem(
                    "currentUser",
                    JSON.stringify(data.user)
                );


                console.log(
                    "✅ Login successful:",
                    data.user
                );


                alert(
                    "Welcome " +
                    data.user.name +
                    "!"
                );


                /* ==========================================
                   ROLE REDIRECT
                ========================================== */

                redirectUserByRole(
                    data.user
                );

            }

            catch (error) {

                console.error(
                    "❌ Login error:",
                    error
                );

                alert(
                    "❌ Could not connect to Kisan Connect server."
                );


                if (loginBtn) {

                    loginBtn.disabled =
                        false;

                    loginBtn.textContent =
                        originalText;

                }

            }

        }
    );

}


/* ==========================================
   ROLE-BASED REDIRECT

   This function is used by BOTH:
   - Signup
   - Login
========================================== */

function redirectUserByRole(user) {

    if (!user || !user.role) {

        console.error(
            "❌ Invalid user data:",
            user
        );

        alert(
            "Something went wrong with your account."
        );

        return;
    }


    /* ==========================================
       FARMER
    ========================================== */

    if (
        user.role === "Farmer"
    ) {

        window.location.href =
            "farmer-dashboard.html";

    }


    /* ==========================================
       LABOURER
    ========================================== */

    else if (
        user.role === "Labourer"
    ) {

        window.location.href =
            "labour-dashboard.html";

    }


    /* ==========================================
       SELLER
    ========================================== */

    else if (
        user.role === "Seller"
    ) {

        window.location.href =
            "seller-dashboard.html";

    }


    /* ==========================================
       UNKNOWN ROLE
    ========================================== */

    else {

        console.error(
            "❌ Unknown role:",
            user.role
        );

        alert(
            "Invalid user role."
        );

    }

}


/* ==========================================
   SYSTEM READY
========================================== */

console.log(
    "🌾 Kisan Connect Authentication System Loaded!"
);