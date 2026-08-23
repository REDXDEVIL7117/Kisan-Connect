/* ============================================
   KISAN CONNECT
   script.js
============================================ */

// Welcome Message
console.log("🌾 Welcome to Kisan Connect!");


// ============================================
// DARK MODE
// ============================================

const themeBtn = document.getElementById("themeBtn");

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");

    if (themeBtn) {
        themeBtn.textContent = "☀️";
    }
}

if (themeBtn) {

    themeBtn.addEventListener("click", () => {

        document.body.classList.toggle("dark");

        if (document.body.classList.contains("dark")) {

            localStorage.setItem("theme", "dark");
            themeBtn.textContent = "☀️";

        } else {

            localStorage.setItem("theme", "light");
            themeBtn.textContent = "🌙";

        }

    });

}



// ============================================
// LANGUAGE TOGGLE
// ============================================

const languageBtn = document.getElementById("languageBtn");

let currentLanguage = "EN";

if (languageBtn) {

    languageBtn.addEventListener("click", () => {

        if (currentLanguage === "EN") {

            currentLanguage = "HI";

            languageBtn.innerHTML = "हिन्दी | EN";

            alert(
                "🚧 Hindi Translation will be added in a future update."
            );

        } else {

            currentLanguage = "EN";

            languageBtn.innerHTML = "EN | हिन्दी";

        }

    });

}



// ============================================
// BUTTON ACTIONS
// ============================================

const primaryButtons = document.querySelectorAll(".primary-btn");
const secondaryButtons = document.querySelectorAll(".secondary-btn");

primaryButtons.forEach(button => {

    // Don't show the alert for links (like Get Started)
    if (button.tagName === "A") return;

    button.addEventListener("click", () => {

        alert("🚧 Feature coming soon!");

    });

});

secondaryButtons.forEach(button => {

    button.addEventListener("click", () => {

        alert("🛒 Marketplace will be available soon.");

    });

});


// ============================================
// CARD HOVER ANIMATION
// ============================================

const cards = document.querySelectorAll(
    ".about-card, .service-card, .preview-card, .product-card, .support-card, .stat-card"
);

cards.forEach(card => {

    card.addEventListener("mouseenter", () => {

        card.style.transform = "translateY(-10px)";
        card.style.transition = "0.3s";

    });

    card.addEventListener("mouseleave", () => {

        card.style.transform = "translateY(0px)";

    });

});



// ============================================
// SCROLL ANIMATION
// ============================================

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0px)";

        }

    });

}, {
    threshold: 0.2
});

const sections = document.querySelectorAll("section");

sections.forEach(section => {

    section.style.opacity = "0";
    section.style.transform = "translateY(50px)";
    section.style.transition = "0.8s";

    observer.observe(section);

});



// ============================================
// NAVBAR SHADOW ON SCROLL
// ============================================

window.addEventListener("scroll", () => {

    const navbar = document.querySelector(".navbar");

    if (!navbar) return;

    if (window.scrollY > 50) {

        navbar.style.boxShadow = "0 8px 25px rgba(0,0,0,.15)";

    } else {

        navbar.style.boxShadow = "0 8px 20px rgba(0,0,0,.08)";

    }

});


// ============================================
// FUTURE PLACEHOLDER
// ============================================

// Future Features:
//
// - User Login
// - Signup
// - Farmer Dashboard
// - Labour Dashboard
// - Marketplace
// - Shopping Cart
// - AI Crop Detection
// - AI Pest Detection
// - Notifications
// - Weather API
// - Google Maps
// - Chat System
// - Payment Gateway
// - Admin Panel



console.log("✅ script.js loaded successfully.");