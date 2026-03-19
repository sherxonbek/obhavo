const sevenDays = document.querySelector(".sevenDays");
const input = document.querySelector(".input");
const suggestions = document.querySelector(".suggestions");
const currentDay = document.querySelector(".currentDay");
const continer = document.querySelector(".continer");

let api = "ae654064c53f4422a0a110456261803";

async function searchCity(city) {
    let url = `https://api.weatherapi.com/v1/search.json?key=${api}&q=${city}`;
    let response = await fetch(url);
    let data = await response.json();
    return data;
}

async function weatherApi(city = Toshkent) {
    let url = `https://api.weatherapi.com/v1/forecast.json?key=${api}&q=${city}&days=7`;
    let response = await fetch(url);
    let data = await response.json();
    return data;
}
weather("Toshkent");

const weatherUz = {
    1000: "Quyoshli",
    1003: "Qisman bulutli",
    1006: "Bulutli",
    1009: "Bulut qoplagan",
    1063: "Yomg‘irli",
    1087: "Momaqaldiroqli",
    1183: "Yengil yomg‘ir",
    1189: "O‘rtacha yomg‘ir",
    1195: "Kuchli yomg‘ir",
    1240: "Yengil yomg‘ir"
};

async function weather(city) {
    let data = await weatherApi(city);

    if (data.error) {
        currentDay.innerHTML = `<p>${data.error.message}</p>`;
        sevenDays.innerHTML = "";
        return;
    }

    currentDay.innerHTML = "";
    sevenDays.innerHTML = "";

    const todayDiv = document.createElement("div");
    todayDiv.classList.add("today");

    let code = data.current.condition.code;
    let uzText = weatherUz[code] || code;

    let humidity = data.current.humidity;

    let windSpeed = (data.current.wind_kph / 3.6).toFixed(1);
    let windDir = data.current.wind_dir;

    let pressure = (data.current.pressure_mb * 0.75006).toFixed(0);

    let moon = data.forecast.forecastday[0].astro.moon_phase;

    let sunrise = data.forecast.forecastday[0].astro.sunrise;
    let sunset = data.forecast.forecastday[0].astro.sunset;

    todayDiv.innerHTML = `
        <div class = "obhavo">
            <h2>${data.location.name}</h2>
            <img src="${data.current.condition.icon}" alt="">
            <p class = "temp">${data.current.temp_c} / ${data.forecast.forecastday[0].day.mintemp_c} °C</p>
            <p>${uzText}</p> 
        </div>
        <div class = "qoshimcha">
            <p>▶ Namlik: ${humidity}%</p>
            <p>▶ Shamol: ${windDir}, ${windSpeed} m/s</p>
            <p>▶ Bosim: ${pressure} mm sim. ust.</p>
            <p>▶ Oy: ${moon}</p>
            <p>▶ Quyosh chiqishi: ${sunrise}</p>
            <p>▶ Quyosh botishi: ${sunset}</p>
        </div>
    `;

    currentDay.appendChild(todayDiv);
    const obhavo = document.querySelector(".obhavo");
    obhavo.classList.add("weather-bg");

    if ([1240, 1183, 1189, 1195].includes(code)) {
        obhavo.classList.add("Rain");
    } else if (code === 1000) {
        obhavo.classList.add("Sunny");
    } else if (code === 1006 || code === 1003){
        obhavo.classList.add("Cloudy");
    } else if(code === 1087){
        obhavo.classList.add("Thundery");
    }

    let days = data.forecast.forecastday.slice(1);

    days.forEach(day => {
        const div = document.createElement("div");
        div.classList.add("seven");

        let code = day.day.condition.code;
        let uzText = weatherUz[code] || data.current.condition.text;
        let img = day.day.condition.icon;
        let date = day.date;
        let maxTemp = day.day.maxtemp_c;
        let minTemp = day.day.mintemp_c;

        div.innerHTML = `
            <h3>${date}</h3>
            <img src="${img}" class = "iconImg">
            <p>${maxTemp} / ${minTemp}°C</p>
            <p>${uzText}</p>
        `;

        sevenDays.appendChild(div);
    });
}

let selectedIndex = -1;
let currentCities = [];

input.addEventListener("input", async () => {
    let value = input.value.trim();

    if (value.length < 2) {
        suggestions.innerHTML = "";
        continer.classList.remove("blur");
        return;
    }

    let cities = await searchCity(value);
    currentCities = cities;
    selectedIndex = -1;

    suggestions.innerHTML = "";
    continer.classList.add("blur");

    cities.forEach((city, index) => {
        const div = document.createElement("div");
        div.textContent = `${city.name}, ${city.region}, ${city.country}`;

        div.classList.add("citySearch");

        div.addEventListener("click", () => {
            input.value = city.name;
            suggestions.innerHTML = "";
            continer.classList.remove("blur");
            weather(city.name);
            input.value = "";
        });

        suggestions.appendChild(div);
    });
});

input.addEventListener("keydown", (e) => {
    continer.classList.remove("blur");
    let items = suggestions.querySelectorAll("div");

    if (e.key === "ArrowDown") {
        selectedIndex++;
        if (selectedIndex >= items.length) selectedIndex = 0;
    }

    if (e.key === "ArrowUp") {
        selectedIndex--;
        if (selectedIndex < 0) selectedIndex = items.length - 1;
    }
    items.forEach(item => item.classList.remove("active"));

    if (items[selectedIndex]) {
        items[selectedIndex].classList.add("active");
    }
    if (e.key === "Enter") {
        e.preventDefault();

        if (selectedIndex >= 0) {
            let city = currentCities[selectedIndex];
            input.value = city.name;
            suggestions.innerHTML = "";
            weather(city.name);
            input.value = "";
        } else {
            let city = input.value.trim();
            if (city) {
                suggestions.innerHTML = "";
                weather(city);
                input.value = "";
            }
        }
    }
});

