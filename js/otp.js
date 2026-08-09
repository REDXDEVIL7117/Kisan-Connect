/* ==========================================
   KISAN CONNECT
   otp.js
========================================== */

// ==========================================
// OTP FORM
// ==========================================

const otpForm = document.getElementById("otpForm");

const otpInput = document.getElementById("otp");

const resendBtn = document.getElementById("resendBtn");

const message = document.getElementById("message");


// ==========================================
// HELPER: SHOW MESSAGE
// ==========================================

function showMessage(text, success = false) {

    message.textContent = text;

    if (success) {

        message.style.color = "#2e7d32";

    } else {

        message.style.color = "#d32f2f";

    }

}


// ==========================================
// VERIFY OTP
// ==========================================

if (otpForm) {

    otpForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const otp = otpInput.value.trim();


        // ------------------------------
        // BASIC VALIDATION
        // ------------------------------

        if (!/^\d{6}$/.test(otp)) {

            showMessage(
                "Please enter a valid 6-digit OTP."
            );

            return;

        }


        // ------------------------------
        // DISABLE BUTTON
        // ------------------------------

        const verifyButton =
            otpForm.querySelector("button");

        verifyButton.disabled = true;

        verifyButton.textContent =
            "Verifying...";


        // ------------------------------
        // SEND OTP TO BACKEND
        // ------------------------------

        try {

            const response = await fetch(

                "http://localhost:3000/api/signup/verify-otp",

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    credentials: "include",

                    body: JSON.stringify({

                        otp: otp

                    })

                }

            );


            const data =
                await response.json();


            // ------------------------------
            // ERROR
            // ------------------------------

            if (!response.ok) {

                showMessage(
                    data.error ||
                    "OTP verification failed."
                );

                verifyButton.disabled = false;

                verifyButton.textContent =
                    "Verify Email";

                return;

            }


            // ------------------------------
            // SUCCESS
            // ------------------------------

            showMessage(
                "🎉 Email verified! Account created successfully.",
                true
            );


            // Save the newly created user

            if (data.user) {

                localStorage.setItem(

                    "currentUser",

                    JSON.stringify(data.user)

                );

            }


            // Redirect to login

            setTimeout(function () {

                window.location.href =
                    "login.html";

            }, 1500);


        } catch (error) {

            console.error(
                "OTP verification error:",
                error
            );

            showMessage(
                "❌ Could not connect to Kisan Connect server."
            );

            verifyButton.disabled = false;

            verifyButton.textContent =
                "Verify Email";

        }

    });

}


// ==========================================
// RESEND OTP
// ==========================================

if (resendBtn) {

    resendBtn.addEventListener(
        "click",
        async function () {

            resendBtn.disabled = true;

            resendBtn.textContent =
                "Sending...";


            try {

                const response = await fetch(

                    "http://localhost:3000/api/signup/resend-otp",

                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        credentials: "include"

                    }

                );


                const data =
                    await response.json();


                if (!response.ok) {

                    showMessage(
                        data.error ||
                        "Could not resend OTP."
                    );

                    resendBtn.disabled = false;

                    resendBtn.textContent =
                        "Resend OTP";

                    return;

                }


                showMessage(
                    "📧 A new OTP has been sent to your email.",
                    true
                );


                resendBtn.textContent =
                    "OTP Sent ✓";


                // Allow another resend after 30 seconds

                setTimeout(function () {

                    resendBtn.disabled = false;

                    resendBtn.textContent =
                        "Resend OTP";

                }, 30000);


            } catch (error) {

                console.error(
                    "Resend OTP error:",
                    error
                );

                showMessage(
                    "❌ Could not connect to Kisan Connect server."
                );

                resendBtn.disabled = false;

                resendBtn.textContent =
                    "Resend OTP";

            }

        }
    );

}


console.log(
    "🌾 Kisan Connect OTP System Loaded Successfully!"
);