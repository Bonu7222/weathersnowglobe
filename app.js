const form = document.getElementById('searchForm');
const input = document.getElementById('cityInput');
const particlesEl = document.getElementById('particles');
const cityEl = document.getElementById('cityName');
const tempEl = document.getElementById('temperature');
const conditionEl = document.getElementById('condition');
const statusEl = document.getElementById('status');

const conditions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Rime fog',
    51: 'Light drizzle',
    53: 'Drizzle',
    55: 'Dense drizzle',
    56: 'Freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Light rain',
    63: 'Rain',
    65: 'Heavy rain',
    66: 'Freezing rain',
    67: 'Heavy freezing rain',
    71: 'Light snow',
    73: 'Snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Light showers',
    81: 'Showers',
    82: 'Violent showers',
    85: 'Snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Severe thunderstorm'
};

const snowCodes = [71, 73, 75, 77, 85, 86];
const rainCodes = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99];
const sunCodes = [0,1];

function clearParticles() {
    particlesEl.replaceChildren();
}

function addParticle(className, style) {
    const el = document.createElement('div');
    el.className = `particle ${className}`;
    for (const [key, value] of Object.entries(style)){
        if (key.startsWith('--')) {
            el.style.setProperty(key, value);
        } else {
            el.style[key] = value;
        }
    }
    particlesEl.appendChild(el);
}

function renderSnow() {
    clearParticles();
    for (let i = 0; i<40; i++){
        const size = 3+Math.random()*5;
        addParticle('snow', {
            width: `${size}px`,
            height: `${size}px`,
            left: `${Math.random()*100}%`,
            animationDuration: `${3+Math.random()*4}s`,
            animationDelay: `-${Math.random()*7}s`,
            '--drift': `${(Math.random()-0.5)*60}px`
        });
    }
}

function renderRain() {
    clearParticles();
    for (let i = 0; i<35; i++){
        const width = 1+Math.random();
        addParticle('rain', {
            width: `${width}px`,
            height: `${width*7}px`,
            left: `${Math.random()*100}%`,
            animationDuration: `${1+Math.random() * 0.8}s`,
            animationDelay: `-${Math.random()*4}s`,
            '--drift': `${(Math.random()-0.5)*20}px`
        });
    }
}

function renderSun(){
    clearParticles();
    for (let i = 0; i<15; i++){
        const size = 4+Math.random()*6;
        addParticle('sun', {
            width: `${size}px`,
            height: `${size}px`,
            left: `${15 + Math.random()*70}%`,
            top: `${30+Math.random()*40}%`,
            animation: `drift ${4+Math.random()*4}s ease-in-out -${Math.random()*6}s infinite`
        });
    }
}

function renderWeather(code){
    if (snowCodes.includes(code)) renderSnow();
    else if (rainCodes.includes(code)) renderRain();
    else if (sunCodes.includes(code)) renderSun();
    else clearParticles();
}

async function fetchWeather(city){
    statusEl.textContent = 'Loading...';
    statusEl.classList.remove('error');

    try {
        const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );
        if (!geoRes.ok) throw new Error('Network error');
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0){
            throw new Error(`No results for "${city}"`);
        }

        const {latitude, longitude, name, country}  = geoData.results[0];

        const weatherRes = await fetch(
             `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
        );
        if (!weatherRes.ok) throw new Error('Weather unavailable');
        const weatherData = await weatherRes.json();
        const {temperature, weathercode} = weatherData.current_weather;

        cityEl.textContent = country ? `${name}, ${country}` : name;
        tempEl.textContent = `${Math.round(temperature)}°`;
        conditionEl.textContent = conditions[weathercode] ?? 'Unknown';
        statusEl.textContent = `Updated at ${new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        })}`;

        renderWeather(weathercode);
    } catch (error) {
        statusEl.textContent = error.message;
        statusEl.classList.add('error');
        cityEl.textContent = '--';
        tempEl.textContent = '--°';
        conditionEl.textContent = 'Try another city';
        clearParticles();
    }
}

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const city = input.value.trim();
    if (city) fetchWeather(city);
});

fetchWeather('Reykjavik');