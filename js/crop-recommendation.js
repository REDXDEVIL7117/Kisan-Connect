/* ==========================================
   🌾 KISAN CONNECT
   crop-recommendation.js
   STAGE 8.2
========================================== */

"use strict";

console.log("🌱 Crop Recommendation System Loaded.");


// ==========================================
// ELEMENTS
// ==========================================

const form =
    document.getElementById("recommendationForm");

const resultBox =
    document.getElementById("recommendationResults");

const themeBtn =
    document.getElementById("themeBtn");


// ==========================================
// DARK MODE
// ==========================================

function loadTheme() {

    if (localStorage.getItem("theme") === "dark") {

        document.body.classList.add("dark");

        if (themeBtn) {

            themeBtn.textContent = "☀️";

        }

    }

}

function toggleTheme() {

    document.body.classList.toggle("dark");

    const isDark =
        document.body.classList.contains("dark");

    localStorage.setItem(
        "theme",
        isDark ? "dark" : "light"
    );

    if (themeBtn) {

        themeBtn.textContent =
            isDark ? "☀️" : "🌙";

    }

}

loadTheme();

if (themeBtn) {

    themeBtn.addEventListener(
        "click",
        toggleTheme
    );

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

    form.addEventListener(
        "submit",
        function (e) {

            e.preventDefault();

            console.log(
                "🌱 Crop recommendation request submitted."
            );


            // ==========================================
            // GET VALUES
            // ==========================================

            const state =
                document
                    .getElementById("state")
                    .value;

            const district =
                document
                    .getElementById("district")
                    .value
                    .trim();

            const soil =
                document
                    .getElementById("soilType")
                    .value;

            const season =
                document
                    .getElementById("season")
                    .value;

            const irrigation =
                document
                    .getElementById("irrigation")
                    .value;

            const farmSize =
                document
                    .getElementById("farmSize")
                    .value;


            // ==========================================
            // VALIDATION
            // ==========================================

            if (
                !state ||
                !district ||
                !soil ||
                !season ||
                !irrigation
            ) {

                alert(
                    "Please fill all required fields."
                );

                return;

            }


            // ==========================================
            // SHOW RECOMMENDATION
            // ==========================================

            showRecommendation(
                state,
                district,
                season,
                soil,
                irrigation,
                farmSize
            );

        }
    );

} else {

    console.error(
        "❌ Crop recommendation form was not found."
    );

}


// ==========================================
// SHOW RESULT
// ==========================================

function showRecommendation(
    state,
    district,
    season,
    soil,
    irrigation,
    farmSize
) {

    // ==========================================
    // CHECK DATABASE
    // ==========================================

    if (
        !cropDatabase[state] ||
        !cropDatabase[state][season] ||
        !cropDatabase[state][season][soil]
    ) {

        resultBox.innerHTML = `

            <div class="recommendation-card">

                <h2>
                    ⚠️ Recommendation Not Available
                </h2>

                <p>

                    Our recommendation database
                    does not currently have data for:

                </p>

                <p>

                    <strong>State:</strong>
                    ${state}

                    <br>

                    <strong>Season:</strong>
                    ${season}

                    <br>

                    <strong>Soil:</strong>
                    ${soil}

                </p>

                <p>

                    Please try another combination.

                </p>

            </div>

        `;

        return;

    }


    // ==========================================
    // GET CROPS
    // ==========================================

    const crops =
        cropDatabase[state][season][soil];


    // ==========================================
    // FARM SIZE TEXT
    // ==========================================

    const farmSizeText =
        farmSize
            ? `${farmSize} acre(s)`
            : "Not specified";


    // ==========================================
    // DISPLAY RESULT
    // ==========================================

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

                <strong>District:</strong>
                ${district}

            </p>


            <p>

                <strong>Season:</strong>
                ${season}

            </p>


            <p>

                <strong>Soil:</strong>
                ${soil}

            </p>


            <p>

                <strong>Irrigation:</strong>
                ${irrigation}

            </p>


            <p>

                <strong>Farm Size:</strong>
                ${farmSizeText}

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
                    Apply fertilizer according
                    to soil health.
                </li>

                <li>
                    Monitor crops regularly
                    for pests.
                </li>

                <li>
                    Irrigate according to
                    crop requirement.
                </li>

            </ul>

        </div>

    `;


    // ==========================================
    // SCROLL TO RESULT
    // ==========================================

    resultBox.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });


    console.log(
        "✅ Crop recommendation displayed."
    );

}


// ==========================================
// READY
// ==========================================

console.log(
    "✅ Crop Recommendation System Ready."
);