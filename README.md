# Atmos — Real-Time Weather Dashboard

**Created by:** Adarsh Verma  
**Project topic:** Asynchronous JavaScript & RESTful APIs

Atmos is a responsive weather dashboard. A user enters a city name, the application finds its geographical coordinates and then fetches current weather measurements from a public REST API.

## Features

- Search for weather by city name.
- Fetch live/current weather data using the JavaScript Fetch API.
- Use `async`/`await` to handle asynchronous API requests.
- Display temperature, feels-like temperature, humidity, wind speed and wind direction.
- Convert weather codes into readable condition labels and icons.
- Show the selected city's local time.
- Refresh the latest weather for the selected city.
- Handle unknown cities, network errors, HTTP errors and unreadable responses.
- Render nested JSON data dynamically in the page.
- Responsive layout for desktop and mobile.

## API used

This project uses **Open-Meteo**, a public weather data service. No API key is required for this project.

1. Geocoding endpoint: `https://geocoding-api.open-meteo.com/v1/search`
   - Receives a city name.
   - Returns matching location details, including latitude, longitude and country.
2. Forecast endpoint: `https://api.open-meteo.com/v1/forecast`
   - Receives latitude and longitude.
   - Returns current weather data in a nested JSON response.

Official documentation: https://open-meteo.com/en/docs

## How to run

1. Extract the ZIP file.
2. Open the `Adarsh_Verma_Weather_Dashboard` folder.
3. Open `index.html` in a modern browser.
4. Make sure the device has an internet connection.
5. Search for a city such as New Delhi, Mumbai, London or Tokyo.

No npm packages or build tools are required. If your browser restricts local-file requests, run the folder using VS Code Live Server.

## Project structure

```text
Adarsh_Verma_Weather_Dashboard/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
└── README.md
```

## Concepts demonstrated

| Concept | Implementation |
|---|---|
| Fetch API | `fetch()` requests the public REST endpoints |
| async/await | `findCity()`, `getWeather()` and `loadWeather()` |
| JSON parsing | `response.json()` |
| REST API | Geocoding and weather endpoints |
| Error handling | `try/catch`, HTTP status checks and user-facing messages |
| Nested JSON | Measurements are read from `data.current` |
| DOM manipulation | Weather values are updated with `textContent` and `innerHTML` |
| Event handling | Form submission and refresh button |
| Dynamic rendering | Weather panel updates based on API response |

## How the application works

1. The user enters a city name and submits the search form.
2. `loadWeather()` calls `findCity()`, which sends a request to the geocoding endpoint.
3. The geocoding response provides the selected place's latitude and longitude.
4. `getWeather()` sends those coordinates to the forecast endpoint.
5. The API response is parsed as JSON. Current measurements are contained in the nested `current` object.
6. `displayWeather()` updates the DOM with the weather values and condition icon.
7. If a request fails, a readable error message is displayed instead of leaving the user without feedback.

## Error handling

- Empty city input is not submitted.
- A city that does not match a geocoding result displays a not-found message.
- Network failures display a connection message.
- Non-success HTTP responses display an HTTP error message.
- Invalid JSON or missing current weather data is handled gracefully.
- A request identifier prevents an older search response from replacing a newer search result.

## Testing checklist

- [ ] Search for a valid city such as New Delhi.
- [ ] Search for another city such as Mumbai or London.
- [ ] Search for a city name that does not exist.
- [ ] Try submitting an empty search.
- [ ] Turn off the internet and check the error message.
- [ ] Refresh weather after a successful search.
- [ ] Check the displayed temperature, humidity and wind values.
- [ ] Test the layout at mobile and desktop widths.

## Data and privacy

The application sends the city name to Open-Meteo's geocoding service and uses the returned coordinates to request weather data. It does not require a login or store personal information.
