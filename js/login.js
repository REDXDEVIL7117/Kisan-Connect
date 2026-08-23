/* ==========================================
   🌾 KISAN CONNECT
   login.js
========================================== */

/* ==========================================
   API CONFIGURATION
========================================== */

// LIVE RENDER BACKEND
const API_URL = "https://kisan-connect-backend.onrender.com";
// Later, when frontend is hosted:
// const API_URL = "https://kisan-connect-backend.onrender.com";


/* ==========================================
   SIGNUP SYSTEM
========================================== */

const signupForm =
    document.getElementById("signupForm");


if (signupForm) {

    signupForm.addEventListener(
        "submit",
        async function (e) {

            // IMPORTANT:
            // Stop the browser from refreshing
            // the page before doing anything else.
            e.preventDefault();

            console.log(
                "🚀 SIGNUP SUBMIT FIRED"
            );


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
               DISABLE BUTTON
            ========================================== */

            const signupBtn =
                document.getElementById("signupBtn");

            signupBtn.disabled = true;

            signupBtn.textContent =
                "Sending OTP...";


            /* ==========================================
               SEND OTP REQUEST
            ========================================== */

            try {

                console.log(
                    "📡 Sending OTP request..."
                );

                console.log(
                    "📡 API:",
                    `${API_URL}/api/signup/request-otp`
                );


                const response =
                    await fetch(
                        `${API_URL}/api/signup/request-otp`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            credentials: "include",

                            body: JSON.stringify({

                                name,
                                phone,
                                email,
                                password,
                                role

                            })
                        }
                    );


                console.log(
                    "📥 Backend status:",
                    response.status
                );


                const data =
                    await response.json();


                /* ==========================================
                   BACKEND ERROR
                ========================================== */

                if (!response.ok) {

                    console.error(
                        "❌ Backend error:",
                        data
                    );

                    alert(
                        data.error ||
                        "Could not send verification code."
                    );

                    signupBtn.disabled = false;

                    signupBtn.textContent =
                        "Create Account";

                    return;
                }


                /* ==========================================
                   OTP SENT
                ========================================== */

                console.log(
                    "✅ OTP request successful"
                );

                alert(
                    "📧 Verification code sent to your email!"
                );


                // Move to OTP page
                window.location.href =
                    "otp.html";

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
                    "Create Account";
            }

        }
    );

}


console.log(
    "🌾 Kisan Connect Signup System Loaded Successfully!"
);


/* ==========================================
   LOGIN SYSTEM
========================================== */

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (e) {

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
               LOGIN REQUEST
            ========================================== */

            try {

                const response =
                    await fetch(
                        `${API_URL}/api/login`,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            credentials: "include",

                            body: JSON.stringify({

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

                    return;
                }


                /* ==========================================
                   SAVE USER
                ========================================== */

                localStorage.setItem(
                    "currentUser",
                    JSON.stringify(data.user)
                );


                alert(
                    "Welcome " +
                    data.user.name +
                    "!"
                );


                /* ==========================================
                   ROLE REDIRECT
                ========================================== */

                if (
                    data.user.role ===
                    "Farmer"
                ) {

                    window.location.href =
                        "farmer-dashboard.html";

                }

                else if (
                    data.user.role ===
                    "Labourer"
                ) {

                    window.location.href =
                        "labour-dashboard.html";

                }

                else {

                    window.location.href =
                        "seller-dashboard.html";
                }

            }

            catch (error) {

                console.error(
                    "❌ Login error:",
                    error
                );

                alert(
                    "❌ Could not connect to Kisan Connect server."
                );
            }

        }
    );

}