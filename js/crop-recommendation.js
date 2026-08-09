/* ==========================================
   KISAN CONNECT
   crop-recommendation.js
   STAGE 8.2
========================================== */

console.log("🌱 Crop Recommendation System Loaded.");


// ==========================================
// ELEMENTS
// ==========================================

const form =
    document.getElementById("cropForm");

const resultBox =
    document.getElementById("resultBox");

const themeBtn =
    document.getElementById("themeBtn");


// ==========================================
// DARK MODE
// ==========================================

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

        }

        else {

            localStorage.setItem("theme", "light");

            themeBtn.textContent = "🌙";

        }

    });

}


// ==========================================
// RECOMMENDATION DATABASE
// ==========================================

const cropDatabase = {

    Rajasthan: {

        Kharif: {

            Sandy: [
                "Bajra",
                "Moong",
                "Guar"
            ],

            Loamy: [
                "Groundnut",
                "Cotton",
                "Maize"
            ],

            Clay: [
                "Cotton",
                "Soybean"
            ]

        },

        Rabi: {

            Sandy: [
                "Mustard",
                "Gram"
            ],

            Loamy: [
                "Wheat",
                "Barley",
                "Mustard"
            ],

            Clay: [
                "Wheat",
                "Gram"
            ]

        }

    },



    Punjab: {

        Kharif: {

            Sandy: [
                "Rice",
                "Cotton"
            ],

            Loamy: [
                "Rice",
                "Maize"
            ],

            Clay: [
                "Rice"
            ]

        },

        Rabi: {

            Sandy: [
                "Wheat",
                "Mustard"
            ],

            Loamy: [
                "Wheat",
                "Barley"
            ],

            Clay: [
                "Wheat"
            ]

        }

    },



    Maharashtra: {

        Kharif: {

            Sandy: [
                "Cotton",
                "Soybean"
            ],

            Loamy: [
                "Soybean",
                "Tur"
            ],

            Clay: [
                "Sugarcane",
                "Cotton"
            ]

        },

        Rabi: {

            Sandy: [
                "Gram"
            ],

            Loamy: [
                "Wheat",
                "Gram"
            ],

            Clay: [
                "Sugarcane"
            ]

        }

    }

};


// ==========================================
// FORM SUBMIT
// ==========================================

if (form) {

    form.addEventListener("submit", function (e) {

        e.preventDefault();

        const state =
            document.getElementById("state").value;

        const season =
            document.getElementById("season").value;

        const soil =
            document.getElementById("soil").value;

        if (
            !state ||
            !season ||
            !soil
        ) {

            alert("Please fill all fields.");

            return;

        }

        showRecommendation(
            state,
            season,
            soil
        );

    });

}


// ==========================================
// SHOW RESULT
// ==========================================

function showRecommendation(
    state,
    season,
    soil
) {

    if (
        !cropDatabase[state] ||
        !cropDatabase[state][season] ||
        !cropDatabase[state][season][soil]
    ) {

        resultBox.innerHTML = `

            <div class="recommendation-card">

                <h2>
                    ⚠️ No Recommendation
                </h2>

                <p>

                    Recommendation database for
                    this combination isn't available yet.

                </p>

            </div>

        `;

        return;

    }

    const crops =
        cropDatabase[state][season][soil];

    resultBox.innerHTML = `

        <div class="recommendation-card">

            <h2>

                🌾 Recommended Crops

            </h2>

            <h3>

                ${crops.join(", ")}

            </h3>

            <hr>

            <p>

                <strong>State:</strong>
                ${state}

            </p>

            <p>

                <strong>Season:</strong>
                ${season}

            </p>

            <p>

                <strong>Soil:</strong>
                ${soil}

            </p>

            <br>

            <h3>

                💡 Farming Tips

            </h3>

            <ul>

                <li>
                    Use certified quality seeds.
                </li>

                <li>
                    Test soil before sowing.
                </li>

                <li>
                    Apply fertilizer according to soil health.
                </li>

                <li>
                    Monitor crops regularly for pests.
                </li>

                <li>
                    Irrigate according to crop requirement.
                </li>

            </ul>

        </div>

    `;

}