/* ==========================================
   KISAN CONNECT
   SMART FARMING DASHBOARD
   smart-farming-dashboard.js
========================================== */

"use strict";

console.log("🌾 Smart Farming Dashboard Loaded");

/* ==========================================
   ELEMENTS
========================================== */

const themeBtn =
    document.getElementById("themeBtn");

const cards =
    document.querySelectorAll(".card");

const comingSoonCards =
    document.querySelectorAll(".coming-soon");

/* ==========================================
   DARK MODE
========================================== */

function loadTheme() {

    if (

        localStorage.getItem("theme") === "dark"

    ) {

        document.body.classList.add("dark");

        if (themeBtn) {

            themeBtn.textContent = "☀️";

        }

    }

}

function toggleTheme() {

    document.body.classList.toggle("dark");

    const dark =

        document.body.classList.contains("dark");

    localStorage.setItem(

        "theme",

        dark ? "dark" : "light"

    );

    if (themeBtn) {

        themeBtn.textContent =

            dark

            ? "☀️"

            : "🌙";

    }

}

loadTheme();

if (themeBtn) {

    themeBtn.addEventListener(

        "click",

        toggleTheme

    );

}

/* ==========================================
   CARD ANIMATION
========================================== */

cards.forEach((card, index) => {

    card.style.opacity = "0";

    card.style.transform =

        "translateY(35px)";

    setTimeout(() => {

        card.style.transition =

            "all .45s ease";

        card.style.opacity = "1";

        card.style.transform =

            "translateY(0)";

    }, index * 120);

});

/* ==========================================
   CARD RIPPLE EFFECT
========================================== */

cards.forEach(card => {

    card.addEventListener(

        "click",

        function () {

            card.style.transform =

                "scale(.98)";

            setTimeout(() => {

                card.style.transform = "";

            }, 120);

        }

    );

});

/* ==========================================
   COMING SOON
========================================== */

comingSoonCards.forEach(card => {

    card.addEventListener(

        "click",

        function (event) {

            event.preventDefault();

            alert(

                "🏛 Government Schemes will be available in a future Kisan Connect update."

            );

        }

    );

});

/* ==========================================
   WELCOME MESSAGE
========================================== */

const currentHour =

    new Date().getHours();

let greeting = "";

if (

    currentHour < 12

) {

    greeting =

        "🌅 Good Morning Farmer!";

}

else if (

    currentHour < 17

) {

    greeting =

        "☀️ Good Afternoon Farmer!";

}

else {

    greeting =

        "🌙 Good Evening Farmer!";

}

console.log(greeting);

/* ==========================================
   KEYBOARD SHORTCUTS
========================================== */

document.addEventListener(

    "keydown",

    function(event){

        if(

            event.key === "Escape"

        ){

            window.location.href =

                "dashboard.html";

        }

        if(

            event.ctrlKey &&

            event.key.toLowerCase()==="d"

        ){

            event.preventDefault();

            toggleTheme();

        }

    }

);

/* ==========================================
   PAGE INFO
========================================== */

console.group(

    "🌾 Smart Farming"

);

console.log(

    "Modules Available"

);

console.table([

    "🌤 Weather Dashboard",

    "🌾 Crop Recommendation",

    "💧 Irrigation Guide",

    "🧪 Fertilizer Guide",

    "📚 Farming Knowledge",

    "🏛 Government Schemes (Future)"

]);

console.groupEnd();

/* ==========================================
   READY
========================================== */

console.log(

    "✅ Smart Farming Dashboard Ready"

);