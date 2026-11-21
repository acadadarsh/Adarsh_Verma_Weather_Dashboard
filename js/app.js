/* Atmos — Asynchronous JavaScript & RESTful APIs
   Uses Fetch API + async/await to retrieve city coordinates and live weather. */
(() => {
  "use strict";

  const API = {
    geocoding: "https://geocoding-api.open-meteo.com/v1/search",
    forecast: "https://api.open-meteo.com/v1/forecast"
  };

  const ui = {
    form: document.querySelector("#searchForm"),
    cityInput: document.querySelector("#cityInput"),
    searchButton: document.querySelector("#searchButton"),
    weatherPanel: document.querySelector("#weatherPanel"),
    welcomePanel: document.querySelector("#welcomePanel"),
    error: document.querySelector("#errorMessage"),
    loading: document.querySelector("#loadingMessage"),
    cityName: document.querySelector("#cityName"),
    localTime: document.querySelector("#localTime"),
    icon: document.querySelector("#weatherIcon"),
    temperature: document.querySelector("#temperature"),
    condition: document.querySelector("#condition"),
    feelsLike: document.querySelector("#feelsLike"),
    humidity: document.querySelector("#humidity"),
    windSpeed: document.querySelector("#windSpeed"),
    windDirection: document.querySelector("#windDirection"),
    updatedAt: document.querySelector("#updatedAt"),
    refresh: document.querySelector("#refreshButton")
  };

  let lastCoordinates = null;
  let activeRequest = 0;

  // Convert a weather condition code from Open-Meteo into readable text and an icon.
  function describeWeather(code, isDay = 1) {
    if (code === 0) return { text: "Clear sky", icon: isDay ? "☀" : "☾" };
    if ([1, 2].includes(code)) return { text: "Mainly clear", icon: "🌤" };
    if (code === 3) return { text: "Overcast", icon: "☁" };
    if ([45, 48].includes(code)) return { text: "Fog", icon: "🌫" };
    if ([51, 53, 55, 56, 57].includes(code)) return { text: "Drizzle", icon: "🌦" };
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { text: "Rain", icon: "🌧" };
    if ([71, 73, 75, 77, 85, 86].includes(code)) return { text: "Snow", icon: "❄" };
    if ([95, 96, 99].includes(code)) return { text: "Thunderstorm", icon: "⛈" };
    return { text: "Current conditions", icon: "🌤" };
  }

  // A reusable JSON fetch helper with HTTP status and network error handling.
  async function fetchJSON(url) {
    let response;
    try {
      response = await fetch(url, { headers: { Accept: "application/json" } });
    } catch (error) {
      throw new Error("Network connection failed. Check your internet connection and try again.");
    }
    if (!response.ok) {
      throw new Error(`Weather service returned an error (HTTP ${response.status}). Please try again.`);
    }
    try {
      return await response.json();
    } catch (error) {
      throw new Error("The server returned data that could not be read. Please try again.");
    }
  }

  async function findCity(city) {
    const url = new URL(API.geocoding);
    url.search = new URLSearchParams({
      name: city,
      count: "1",
      language: "en",
      format: "json"
    }).toString();

    const data = await fetchJSON(url);
    if (!data.results || data.results.length === 0) {
      throw new Error(`We couldn't find "${city}". Check the spelling or try another city.`);
    }
    return data.results[0];
  }

  async function getWeather(latitude, longitude) {
    const url = new URL(API.forecast);
    url.search = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m",
      timezone: "auto"
    }).toString();

    const data = await fetchJSON(url);
    if (!data.current) throw new Error("Weather information is currently unavailable for this location.");
    return data;
  }

  function showLoading(isLoading) {
    ui.loading.hidden = !isLoading;
    ui.searchButton.disabled = isLoading;
    ui.searchButton.textContent = isLoading ? "Loading…" : "Search →";
  }

  function displayWeather(place, data) {
    // Open-Meteo returns measurements inside the nested `current` object.
    const current = data.current;
    const units = data.current_units || {};
    const condition = describeWeather(current.weather_code, current.is_day);

    ui.cityName.textContent = [place.name, place.admin1, place.country].filter(Boolean).join(", ");
    ui.localTime.textContent = `Local time · ${current.time.replace("T", " ")}`;
    ui.icon.textContent = condition.icon;
    ui.temperature.textContent = `${Math.round(current.temperature_2m)}°`;
    ui.condition.textContent = condition.text;
    ui.feelsLike.textContent = `Feels like ${Math.round(current.apparent_temperature)}${units.apparent_temperature || "°C"}`;
    ui.humidity.innerHTML = `${Math.round(current.relative_humidity_2m)}<small>${units.relative_humidity_2m || "%"}</small>`;
    ui.windSpeed.innerHTML = `${Math.round(current.wind_speed_10m)}<small> ${units.wind_speed_10m || "km/h"}</small>`;
    ui.windDirection.innerHTML = `${Math.round(current.wind_direction_10m)}<small>°</small>`;
    ui.updatedAt.textContent = `Weather time: ${current.time.replace("T", " ")}`;

    ui.weatherPanel.hidden = false;
    ui.welcomePanel.hidden = true;
    ui.error.hidden = true;
  }

  async function loadWeather(city) {
    const requestId = ++activeRequest;
    showLoading(true);
    ui.error.hidden = true;

    try {
      const place = await findCity(city);
      const weather = await getWeather(place.latitude, place.longitude);
      // Ignore an older response if the user has already started a newer search.
      if (requestId !== activeRequest) return;
      lastCoordinates = { place, latitude: place.latitude, longitude: place.longitude };
      displayWeather(place, weather);
    } catch (error) {
      if (requestId !== activeRequest) return;
      ui.error.textContent = error.message || "Something went wrong. Please try again.";
      ui.error.hidden = false;
    } finally {
      if (requestId === activeRequest) showLoading(false);
    }
  }

  ui.form.addEventListener("submit", async event => {
    event.preventDefault();
    const city = ui.cityInput.value.trim();
    if (!city) {
      ui.cityInput.focus();
      return;
    }
    await loadWeather(city);
  });

  ui.refresh.addEventListener("click", async () => {
    if (!lastCoordinates) return;
    const { place, latitude, longitude } = lastCoordinates;
    const requestId = ++activeRequest;
    showLoading(true);
    ui.error.hidden = true;
    try {
      const weather = await getWeather(latitude, longitude);
      if (requestId !== activeRequest) return;
      displayWeather(place, weather);
    } catch (error) {
      if (requestId !== activeRequest) return;
      ui.error.textContent = error.message || "Could not refresh weather.";
      ui.error.hidden = false;
    } finally {
      if (requestId === activeRequest) showLoading(false);
    }
  });
})();
