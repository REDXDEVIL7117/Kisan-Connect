/* ==========================================
   KISAN CONNECT
   WEATHER DASHBOARD
   STAGE 8.1
========================================== */

console.log("🌤️ Weather Dashboard Loaded");


// ==========================================
// DARK MODE
// ==========================================

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


// ==========================================
// DEMO WEATHER DATA
// ==========================================

const weatherData = {

    city: "Bikaner",

    temperature: 35,

    feelsLike: 38,

    humidity: 42,

    windSpeed: 18,

    pressure: 1008,

    visibility: 10,

    condition: "Sunny",

    icon: "☀️"

};


// ==========================================
// DISPLAY WEATHER
// ==========================================

function loadWeather() {

    setText("cityName", weatherData.city);

    setText("temperature", weatherData.temperature + "°C");

    setText("weatherCondition", weatherData.condition);

    setText("weatherIcon", weatherData.icon);

    setText("feelsLike", weatherData.feelsLike + "°C");

    setText("humidity", weatherData.humidity + "%");

    setText("windSpeed", weatherData.windSpeed + " km/h");

    setText("pressure", weatherData.pressure + " hPa");

    setText("visibility", weatherData.visibility + " km");

}


// ==========================================
// HELPER
// ==========================================

function setText(id, value) {

    const element = document.getElementById(id);

    if (element) {

        element.textContent = value;

    }

}


// ==========================================
// REFRESH BUTTON
// ==========================================

const refreshBtn = document.getElementById("refreshWeather");

if (refreshBtn) {

    refreshBtn.addEventListener("click", () => {

        refreshBtn.disabled = true;

        refreshBtn.textContent = "Refreshing...";

        setTimeout(() => {

            loadWeather();

            refreshBtn.disabled = false;

            refreshBtn.textContent = "🔄 Refresh";

            alert("✅ Weather updated!");

        }, 1000);

    });

}


// ==========================================
// INITIAL LOAD
// ==========================================

loadWeather();

console.log("✅ Weather Dashboard Ready");