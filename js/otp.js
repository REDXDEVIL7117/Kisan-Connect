/* ==========================================
   🌾 KISAN CONNECT
   otp.js
========================================== */


/* ==========================================
   API CONFIGURATION
========================================== */

const API_URL =
    "http://localhost:3000";


/* ==========================================
   ELEMENTS
========================================== */

const otpForm =
    document.getElementById("otpForm");

const otpInput =
    document.getElementById("otp");

const resendBtn =
    document.getElementById("resendBtn");

const message =
    document.getElementById("message");

const verifyBtn =
    document.getElementById("verifyBtn");


/* ==========================================
   SHOW MESSAGE
========================================== */

function showMessage(
    text,
    success = false
) {

    message.textContent = text;

    message.style.color =
        success
            ? "#2e7d32"
            : "#d32f2f";
}


/* ==========================================
   VERIFY OTP
========================================== */

if (otpForm) {

    otpForm.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();


            const otp =
                otpInput.value.trim();


            /* ==========================================
               VALIDATE OTP
            ========================================== */

            if (!/^\d{6}$/.test(otp)) {

                showMessage(
                    "Please enter a valid 6-digit OTP."
                );

                return;
            }


            /* ==========================================
               DISABLE BUTTON
            ========================================== */

            verifyBtn.disabled = true;

            verifyBtn.textContent =
                "Verifying...";


            /* ==========================================
               VERIFY WITH BACKEND
            ========================================== */

            try {

                console.log(
                    "📡 Sending OTP verification..."
                );


                const response =
                    await fetch(
                        `${API_URL}/api/signup/verify-otp`,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            credentials: "include",

                            body: JSON.stringify({
                                otp
                            })

                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "📥 Verification status:",
                    response.status
                );


                /* ==========================================
                   ERROR
                ========================================== */

                if (!response.ok) {

                    showMessage(
                        data.error ||
                        "OTP verification failed."
                    );

                    verifyBtn.disabled = false;

                    verifyBtn.textContent =
                        "Verify Email";

                    return;
                }


                /* ==========================================
                   SUCCESS
                ========================================== */

                showMessage(
                    "🎉 Email verified! Account created successfully.",
                    true
                );


                if (data.user) {

                    localStorage.setItem(
                        "currentUser",
                        JSON.stringify(data.user)
                    );
                }


                setTimeout(
                    function () {

                        window.location.href =
                            "login.html";

                    },
                    1500
                );

            }

            catch (error) {

                console.error(
                    "❌ OTP verification error:",
                    error
                );

                showMessage(
                    "❌ Could not connect to Kisan Connect server."
                );

                verifyBtn.disabled = false;

                verifyBtn.textContent =
                    "Verify Email";
            }

        }
    );

}


/* ==========================================
   RESEND OTP
========================================== */

if (resendBtn) {

    resendBtn.addEventListener(
        "click",
        async function () {

            resendBtn.disabled = true;

            resendBtn.textContent =
                "Sending...";


            try {

                const response =
                    await fetch(
                        `${API_URL}/api/signup/resend-otp`,
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


                /* ==========================================
                   30 SECOND COOLDOWN
                ========================================== */

                setTimeout(
                    function () {

                        resendBtn.disabled = false;

                        resendBtn.textContent =
                            "Resend OTP";

                    },
                    30000
                );

            }

            catch (error) {

                console.error(
                    "❌ Resend OTP error:",
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