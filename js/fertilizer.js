/* ==========================================
   KISAN CONNECT
   FERTILIZER GUIDE
   STAGE 8.4
========================================== */

console.log("🌱 Fertilizer Guide Loaded");

/* ==========================================
   DARK MODE
========================================== */

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

/* ==========================================
   FORM
========================================== */

const form = document.getElementById("fertilizerForm");
const results = document.getElementById("fertilizerResults");

if (form) {

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        const crop =
            document.getElementById("crop").value;

        const soil =
            document.getElementById("soil").value;

        const season =
            document.getElementById("season").value;

        const farmSize =
            document.getElementById("farmSize").value || "Not Provided";

        if (!crop || !soil || !season) {

            alert("Please complete all required fields.");

            return;

        }

        generateRecommendation(
            crop,
            soil,
            season,
            farmSize
        );

    });

}

/* ==========================================
   RECOMMENDATION DATA
========================================== */

function generateRecommendation(
    crop,
    soil,
    season,
    farmSize
) {

    let fertilizer = "";
    let organic = "";
    let method = "";
    let tips = "";

    switch (crop) {

        case "Wheat":

            fertilizer = "NPK 20-20-0 + Urea";
            organic = "Vermicompost";
            method = "Split application after sowing.";
            tips = "Avoid overwatering after fertilizer.";

            break;

        case "Rice":

            fertilizer = "DAP + Urea + Potash";
            organic = "Farmyard Manure";
            method = "Apply in three equal stages.";
            tips = "Maintain standing water properly.";

            break;

        case "Cotton":

            fertilizer = "NPK 19-19-19";
            organic = "Neem Cake";
            method = "Apply before flowering.";
            tips = "Use drip irrigation if possible.";

            break;

        case "Maize":

            fertilizer = "DAP + Urea";
            organic = "Compost";
            method = "Top dressing after 30 days.";
            tips = "Apply before irrigation.";

            break;

        case "Sugarcane":

            fertilizer = "NPK 12-32-16";
            organic = "Press Mud Compost";
            method = "Split into multiple doses.";
            tips = "Irrigate immediately afterwards.";

            break;

        case "Potato":

            fertilizer = "Potash Rich Fertilizer";
            organic = "Cow Dung Compost";
            method = "Mix into soil before planting.";
            tips = "Avoid excessive nitrogen.";

            break;

        case "Tomato":

            fertilizer = "Balanced NPK";
            organic = "Vermicompost";
            method = "Every 20 days.";
            tips = "Do not touch plant stems.";

            break;

        default:

            fertilizer = "Balanced NPK Fertilizer";
            organic = "Organic Compost";
            method = "Follow soil test recommendations.";
            tips = "Consult local agriculture officers.";

    }

    /* ======================================
       RESULTS
    ====================================== */

    results.innerHTML = `

        <div class="result-box">

            <h3>🌾 Crop</h3>

            <p>${crop}</p>

        </div>

        <div class="result-box">

            <h3>🌍 Soil Type</h3>

            <p>${soil}</p>

        </div>

        <div class="result-box">

            <h3>📅 Season</h3>

            <p>${season}</p>

        </div>

        <div class="result-box">

            <h3>🚜 Farm Size</h3>

            <p>${farmSize} Acres</p>

        </div>

        <div class="result-box">

            <h3>🧪 Recommended Fertilizer</h3>

            <span class="badge">

                ${fertilizer}

            </span>

        </div>

        <div class="result-box">

            <h3>🌿 Organic Alternative</h3>

            <span class="badge">

                ${organic}

            </span>

        </div>

        <div class="result-box">

            <h3>📖 Application Method</h3>

            <p>${method}</p>

        </div>

        <div class="result-box">

            <h3>💡 Farming Tip</h3>

            <p>${tips}</p>

        </div>

        <div class="result-box">

            <h3>⚠️ Safety Advice</h3>

            <p>

                Wear gloves while handling fertilizers.
                Store fertilizers in a cool and dry place.
                Avoid excessive fertilizer usage to
                protect soil health and groundwater.

            </p>

        </div>

    `;

}