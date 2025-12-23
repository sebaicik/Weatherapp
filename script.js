const API_KEY = "YOUR_API_KEY_HERE";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// DOM
const searchInput = document.getElementById("searchInput");
const cityTitle = document.querySelector(".current-weather h2");
const tempEl = document.querySelector(".current-temp");
const conditionEl = document.querySelector(".condition");
const highLowEl = document.querySelector(".high-low");
const weatherIcon = document.querySelector(".weather-icon");
const hourlyList = document.querySelector(".hourly-list");

// ---------- HELPERS ----------
function showError(message) {
  alert(message);
}

function kelvinToC(temp) {
  return Math.round(temp - 273.15);
}

function mapIcon(condition) {
  const map = {
    Clear: "fa-sun",
    Clouds: "fa-cloud",
    Rain: "fa-cloud-rain",
    Snow: "fa-snowflake",
    Thunderstorm: "fa-bolt",
    Drizzle: "fa-cloud-showers-heavy",
    Mist: "fa-smog"
  };
  return map[condition] || "fa-cloud";
}

// ---------- CURRENT WEATHER ----------
async function getWeatherByCity(city) {
  try {
    const res = await fetch(
      `${BASE_URL}/weather?q=${city}&appid=${API_KEY}`
    );

    if (!res.ok) throw new Error("City not found");

    const data = await res.json();
    renderCurrentWeather(data);
    getHourlyForecast(data.coord.lat, data.coord.lon);
  } catch (err) {
    showError(err.message);
  }
}

async function getWeatherByCoords(lat, lon) {
  try {
    const res = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );

    if (!res.ok) throw new Error("Location error");

    const data = await res.json();
    renderCurrentWeather(data);
    getHourlyForecast(lat, lon);
  } catch {
    showError("Unable to fetch location weather");
  }
}

function renderCurrentWeather(data) {
  cityTitle.textContent = `${data.name}, ${data.sys.country}`;
  tempEl.textContent = `${kelvinToC(data.main.temp)}°c`;
  conditionEl.textContent = data.weather[0].description;

  highLowEl.innerHTML = `
    <span><i class="fa-solid fa-arrow-up"></i> High ${kelvinToC(data.main.temp_max)}°</span>
    <span><i class="fa-solid fa-arrow-down"></i> Min ${kelvinToC(data.main.temp_min)}°</span>
  `;

  weatherIcon.className = `fa-solid ${mapIcon(data.weather[0].main)} weather-icon`;
}

// ---------- HOURLY (Today) ----------
async function getHourlyForecast(lat, lon) {
  try {
    const res = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );
    const data = await res.json();

    hourlyList.innerHTML = "";

    data.list.slice(0, 6).forEach(item => {
      const hour = new Date(item.dt_txt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });

      hourlyList.innerHTML += `
        <div class="hour">
          <span class="time">${hour}</span>
          <i class="fa-solid ${mapIcon(item.weather[0].main)}"></i>
          <span class="temp">${kelvinToC(item.main.temp)}°c</span>
        </div>
      `;
    });
  } catch {
    showError("Unable to load forecast");
  }
}

// ---------- SEARCH ----------
searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    const value = searchInput.value.trim();
    if (!value) {
      showError("Please enter a city");
      return;
    }
    getWeatherByCity(value);
  }
});

// ---------- GEOLOCATION ----------
function loadUserLocation() {
  if (!navigator.geolocation) {
    showError("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      getWeatherByCoords(latitude, longitude);
    },
    () => showError("Location permission denied")
  );
}

// INIT
loadUserLocation();
