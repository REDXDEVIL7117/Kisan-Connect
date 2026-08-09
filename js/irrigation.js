/* ==========================================
   KISAN CONNECT
   IRRIGATION GUIDE
   STAGE 8.3
========================================== */

console.log("💧 Irrigation Guide Loaded");

/* ==========================================
   DARK MODE
========================================== */

const themeBtn = document.getElementById("themeBtn");

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    if (themeBtn) themeBtn.textContent = "☀️";
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

/* ==========================================
   FORM
========================================== */

const form = document.getElementById("irrigationForm");

const results = document.getElementById("irrigationResults");

form.addEventListener("submit", function (event) {

    event.preventDefault();

    const crop =
        document.getElementById("crop").value;

    const soil =
        document.getElementById("soil").value;

    const season =
        document.getElementById("season").value;

    const irrigation =
        document.querySelector(
            'input[name="water"]:checked'
        )?.value || "";
    let schedule = "";
    let water = "";
    let tips = [];

    /* ==========================================
       BASIC RECOMMENDATIONS
    ========================================== */

    switch (soil) {

        case "Sandy":

            schedule = "Water every 1-2 days";
            water = "High";

            tips = [
                "Use drip irrigation.",
                "Apply mulch to reduce evaporation.",
                "Water early morning."
            ];

            break;

        case "Loamy":

            schedule = "Water every 3-4 days";
            water = "Medium";

            tips = [
                "Maintain moderate moisture.",
                "Avoid overwatering.",
                "Check soil before watering."
            ];

            break;

        case "Clay":

            schedule = "Water every 5-7 days";
            water = "Low";

            tips = [
                "Clay retains water longer.",
                "Prevent waterlogging.",
                "Water deeply but less often."
            ];

            break;

        case "Black":

            schedule = "Every 5 days";
            water = "Medium";

            tips = [
                "Excellent moisture retention.",
                "Avoid flooding.",
                "Monitor cracks in summer."
            ];

            break;

        default:

            schedule = "Every 3 days";
            water = "Medium";

            tips = [
                "Monitor soil moisture regularly."
            ];

    }

    /* ==========================================
       SEASON ADJUSTMENTS
    ========================================== */

    if (season === "Summer") {

        schedule += " (Increase watering due to heat)";
        tips.push("Water before sunrise or after sunset.");

    }

    if (season === "Rainy") {

        schedule = "Only when required";
        water = "Low";
        tips.push("Avoid irrigation after heavy rainfall.");

    }

    if (season === "Winter") {

        tips.push("Reduce irrigation frequency.");

    }

    /* ==========================================
       IRRIGATION METHOD
    ========================================== */

    let method = "";

switch (irrigation) {

    case "High":

        method =
            "Water is readily available. Regular irrigation can be maintained.";

        break;

    case "Medium":

        method =
            "Use water efficiently. Drip irrigation is recommended.";

        tips.push(
            "Consider drip irrigation to save water."
        );

        break;

    case "Low":

        method =
            "Water is limited. Prioritize water-saving irrigation methods.";

        schedule = "Water only when necessary";

        tips.push(
            "Use mulch to reduce evaporation."
        );

        tips.push(
            "Harvest rainwater whenever possible."
        );

        break;

    default:

        method =
            "Water availability not selected.";

}
    /* ==========================================
       SHOW RESULTS
    ========================================== */

    results.innerHTML = `

        <div class="result-card">

            <h2>💧 Irrigation Recommendation</h2>

            <p><strong>🌾 Crop:</strong> ${crop}</p>

            <p><strong>🪨 Soil:</strong> ${soil}</p>

            <p><strong>☀️ Season:</strong> ${season}</p>

            <p><strong>🚿 Method:</strong> ${method}</p>

            <p><strong>📅 Watering Schedule:</strong> ${schedule}</p>

            <p><strong>💧 Water Requirement:</strong> ${water}</p>

            <hr>

            <h3>🌱 Tips</h3>

            <ul>

                ${tips.map(tip => `<li>${tip}</li>`).join("")}

            </ul>

        </div>

    `;

    results.scrollIntoView({

        behavior: "smooth"

    });

});