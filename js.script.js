
// DOM elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherDisplay = document.getElementById('weather-display');
const errorMessage = document.getElementById('error-message');
const loading = document.getElementById('loading');

// Current weather elements
const currentCity = document.getElementById('current-city');
const currentDate = document.getElementById('current-date');
const currentTemp = document.getElementById('current-temp');
const weatherIcon = document.getElementById('weather-icon');
const windSpeed = document.getElementById('wind-speed');
const humidity = document.getElementById('humidity');
const feelsLike = document.getElementById('feels-like');
const pressure = document.getElementById('pressure');
const forecastCards = document.getElementById('forecast-cards');

// API configuration
const API_KEY = '87125deb976b6f646db98d927408a3d0';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Initialize with default city
document.addEventListener('DOMContentLoaded', () => {
    updateDateTime();
    // Set default city to Navsari
    getWeatherData('Navsari');

    // Update time every minute
    setInterval(updateDateTime, 60000);
});

// Update current date and time
function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDate.textContent = now.toLocaleDateString('en-US', options);
}

// Search button click event
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
    }
});

// Enter key event for search
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
        }
    }
});

// Function to fetch weather data
async function getWeatherData(city) {
    // Show loading indicator
    loading.style.display = 'block';
    weatherDisplay.style.opacity = '0.5';
    errorMessage.style.display = 'none';

    try {
        // Fetch current weather
        const currentResponse = await fetch(
            `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
        );

        if (!currentResponse.ok) {
            throw new Error('City not found');
        }

        const currentData = await currentResponse.json();

        // Fetch 5-day forecast
        const forecastResponse = await fetch(
            `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`
        );

        if (!forecastResponse.ok) {
            throw new Error('Forecast data not available');
        }

        const forecastData = await forecastResponse.json();

        // Display the data
        displayCurrentWeather(currentData);
        displayForecast(forecastData);

    } catch (error) {
        console.error('Error fetching weather data:', error);
        errorMessage.style.display = 'block';
    } finally {
        loading.style.display = 'none';
        weatherDisplay.style.opacity = '1';
    }
}

// Function to display current weather
function displayCurrentWeather(data) {
    currentCity.textContent = `${data.name}, ${data.sys.country}`;
    currentTemp.textContent = `${Math.round(data.main.temp)}°`;
    windSpeed.textContent = `${data.wind.speed} m/s`;
    humidity.textContent = `${data.main.humidity}%`;
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°`;
    pressure.textContent = `${data.main.pressure} hPa`;

    // Set weather icon based on condition
    const condition = data.weather[0].main.toLowerCase();
    setWeatherIcon(condition);
}

// Function to display forecast
function displayForecast(data) {
    // Clear previous forecast
    forecastCards.innerHTML = '';

    // Get one forecast per day (at 12:00 PM)
    const dailyForecasts = [];
    const datesAdded = new Set();

    for (const forecast of data.list) {
        const date = new Date(forecast.dt * 1000);
        const dateString = date.toDateString();

        // Only add one forecast per day (around noon)
        if (!datesAdded.has(dateString) && date.getHours() >= 12) {
            dailyForecasts.push({
                day: getDayName(date.getDay()),
                temp: Math.round(forecast.main.temp),
                condition: forecast.weather[0].main.toLowerCase(),
                date: dateString
            });
            datesAdded.add(dateString);

            // We only need 5 days
            if (dailyForecasts.length >= 5) break;
        }
    }

    // If we don't have 5 days, add from the beginning
    if (dailyForecasts.length < 5) {
        for (const forecast of data.list) {
            const date = new Date(forecast.dt * 1000);
            const dateString = date.toDateString();

            if (!datesAdded.has(dateString)) {
                dailyForecasts.push({
                    day: getDayName(date.getDay()),
                    temp: Math.round(forecast.main.temp),
                    condition: forecast.weather[0].main.toLowerCase(),
                    date: dateString
                });
                datesAdded.add(dateString);

                if (dailyForecasts.length >= 5) break;
            }
        }
    }

    // Generate HTML for forecast cards
    dailyForecasts.forEach(forecast => {
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.innerHTML = `
                    <div class="forecast-day">${forecast.day}</div>
                    <div class="forecast-icon">
                        <i class="${getWeatherIconClass(forecast.condition)}"></i>
                    </div>
                    <div class="forecast-temp">${forecast.temp}°</div>
                `;
        forecastCards.appendChild(forecastCard);
    });
}

// Helper function to get day name from day index
function getDayName(dayIndex) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
}

// Set weather icon based on condition
function setWeatherIcon(condition) {
    let iconClass = 'fas fa-sun'; // default

    if (condition.includes('cloud')) {
        iconClass = 'fas fa-cloud';
    } else if (condition.includes('rain')) {
        iconClass = 'fas fa-cloud-rain';
    } else if (condition.includes('snow')) {
        iconClass = 'fas fa-snowflake';
    } else if (condition.includes('thunderstorm')) {
        iconClass = 'fas fa-bolt';
    } else if (condition.includes('clear')) {
        iconClass = 'fas fa-sun';
    } else if (condition.includes('mist') || condition.includes('fog')) {
        iconClass = 'fas fa-smog';
    }

    weatherIcon.className = iconClass;
}

// Get weather icon class for forecast
function getWeatherIconClass(condition) {
    if (condition.includes('cloud')) {
        return 'fas fa-cloud';
    } else if (condition.includes('rain')) {
        return 'fas fa-cloud-rain';
    } else if (condition.includes('snow')) {
        return 'fas fa-snowflake';
    } else if (condition.includes('thunderstorm')) {
        return 'fas fa-bolt';
    } else if (condition.includes('clear')) {
        return 'fas fa-sun';
    } else if (condition.includes('mist') || condition.includes('fog')) {
        return 'fas fa-smog';
    }

    return 'fas fa-sun'; // default
}
