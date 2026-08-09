/* ==========================================
   KISAN CONNECT
   login.js
========================================== */

// ==========================================
// SIGNUP SYSTEM
// ==========================================

const signupForm = document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        // ==========================================
        // GET FORM VALUES
        // ==========================================

        const name =
            document.getElementById("name").value.trim();

        const phone =
            document.getElementById("phone").value.trim();

        const email =
            document
                .getElementById("email")
                .value
                .trim()
                .toLowerCase();

        const password =
            document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const role =
            document.getElementById("role").value;


        // ==========================================
        // VALIDATION
        // ==========================================

        if (
            name === "" ||
            phone === "" ||
            email === "" ||
            password === "" ||
            confirmPassword === "" ||
            role === ""
        ) {

            alert("Please fill all fields.");
            return;

        }


        // Check phone number

        if (
            phone.length !== 10 ||
            !/^\d{10}$/.test(phone)
        ) {

            alert(
                "Phone number must contain exactly 10 digits."
            );

            return;

        }


        // Check password length

        if (password.length < 6) {

            alert(
                "Password should be at least 6 characters."
            );

            return;

        }


        // Check password confirmation

        if (password !== confirmPassword) {

            alert(
                "Passwords do not match."
            );

            return;

        }


        // ==========================================
        // SEND SIGNUP REQUEST
        // ==========================================

        try {

            const response = await fetch(

                "http://localhost:3000/api/signup/request-otp",

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    credentials: "include",

                    body: JSON.stringify({

                        name: name,

                        phone: phone,

                        email: email,

                        password: password,

                        role: role

                    })

                }

            );


            const data =
                await response.json();


            // ==========================================
            // BACKEND ERROR
            // ==========================================

            if (!response.ok) {

                alert(
                    data.error ||
                    "Could not send verification code."
                );

                return;

            }


            // ==========================================
            // OTP SENT
            // ==========================================

            alert(
                "📧 Verification code sent to your email!"
            );


            // Go to OTP page

            window.location.href = "otp.html";


        }

        catch (error) {

            console.error(
                "Signup error:",
                error
            );

            alert(
                "❌ Could not connect to Kisan Connect server."
            );

        }

    });

}


console.log(
    "🌾 Kisan Connect Signup System Loaded Successfully!"
);


// ==========================================
// LOGIN SYSTEM
// ==========================================

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();


            // ==========================================
            // GET LOGIN VALUES
            // ==========================================

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


            // ==========================================
            // BASIC VALIDATION
            // ==========================================

            if (
                email === "" ||
                password === ""
            ) {

                alert(
                    "Please enter your email and password."
                );

                return;

            }


            // ==========================================
            // SEND LOGIN REQUEST
            // ==========================================

            try {

                const response =
                    await fetch(

                        "http://localhost:3000/api/login",

                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body: JSON.stringify({

                                email: email,

                                password: password

                            })

                        }

                    );


                const data =
                    await response.json();


                // ==========================================
                // LOGIN ERROR
                // ==========================================

                if (!response.ok) {

                    alert(
                        data.error ||
                        "Invalid Email or Password."
                    );

                    return;

                }


                // ==========================================
                // SAVE CURRENT USER
                // ==========================================

                localStorage.setItem(

                    "currentUser",

                    JSON.stringify(
                        data.user
                    )

                );


                alert(
                    "Welcome " +
                    data.user.name +
                    "!"
                );


                // ==========================================
                // ROLE REDIRECT
                // ==========================================

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
                    "Login error:",
                    error
                );

                alert(
                    "❌ Could not connect to Kisan Connect server."
                );

            }

        }
    );

}