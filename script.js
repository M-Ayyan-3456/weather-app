"use strict";

let placeInput = document.querySelector(".place-input");
let place = document.querySelector(".place");
const searchBtn = document.querySelector(".search");
const date = document.querySelector(".date");
const curTemp = document.querySelector(".cur-temp");
const curIcon = document.querySelector(".cur-icon");
const feels = document.querySelector(".other-data-temp");
const humidity = document.querySelector(".other-data-humidity");
const wind = document.querySelector(".other-data-wind");
const perci = document.querySelector(".other-data-perci");
const day = document.querySelectorAll(".day");
const days = document.querySelector(".days");
const hourList = document.querySelector(".hourly-list");
const hour = document.querySelector(".hour-fore");
const hourSection = document.querySelector(".hourly-section");
const dailySection = document.querySelector(".daily-section");
const othersSection = document.querySelector(".others-section");
const hero = document.querySelector(".hero-container");
const dayMax = document.querySelectorAll(".day-temp-max");
const dayMin = document.querySelectorAll(".day-temp-min");
const back = document.querySelector(".back");
const dayImg = document.querySelectorAll(".day-img");
///
let html;
//////////////////////////////
const showLoading = function () {
  back.style.display = "flex";
  back.style.backgroundColor = "#3c3c57";
  back.innerHTML =
    "<p class='dots'><span class='dot'>.</span><span class='dot'>.</span><span class='dot'>.</span></p><p class='loading'>Loading</p>";
  dayMax.forEach((el) => {
    el.style.color = " #25253f";
  });
  dayMin.forEach((el) => {
    el.style.color = " #25253f";
  });
  document.querySelectorAll(".day-name").forEach((el) => {
    el.style.color = " #25253f";
  });
  dayImg.forEach((el) => {
    el.style.display = "none";
  });
};

const clearloading = function () {
  dayImg.forEach((el) => {
    el.style.display = "flex";
  });
  dayMax.forEach((el) => {
    el.style.color = " #fff";
  });
  dayMin.forEach((el) => {
    el.style.color = " #fff";
  });
  document.querySelectorAll(".day-name").forEach((el) => {
    el.style.color = " #fff";
  });
  back.style.display = "none";
  back.innerHTML = "";
};

////////////////
navigator.geolocation.getCurrentPosition(
  async (pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    showLoading();
    await getWeather(lat, lon);
    await dailyWeather(lat, lon);
    clearloading();
  },
  () => {
    console.warn("Location blocked — using default city");
    getPlace("Lahore");
  }
);

async function getPlace(city) {
  if (!city) return;
  const urlPlace = `https://geocoding-api.open-meteo.com/v1/search?name=${city}`;
  try {
    showLoading();
    const res = await fetch(urlPlace);
    const data = await res.json();

    console.log(data);
    const { latitude: lat, longitude: lon, name } = data.results[0];
    if (!res.ok) throw new Error("res not ok");

    place.textContent = name;
    getWeather(lat, lon);
    dailyWeather(lat, lon);
    clearloading();
    return data;
  } catch (error) {
    errorApi();
    console.error("⛔ Error fetching location data", error.message);
    hero.style.background = "none";
    hero.style.backgroundImage = "none";
    hourSection.style.background = "#130f45";
    dailySection.style.background = "none";

    othersSection.style.background = "none";

    hero.textContent = `No such place Found!`;
    hourSection.textContent = ``;
    dailySection.textContent = ``;
    othersSection.textContent = ``;
  }
}
searchBtn.addEventListener("click", () => {
  getPlace(placeInput.value.trim());
});
placeInput.addEventListener("keyup", function (e) {
  if (e.key === "Enter") {
    getPlace(placeInput.value.trim());
  }
});

////////////////////////////
async function getWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,cloud_cover_mean,rain_sum,showers_sum,snowfall_sum&hourly=temperature_2m,cloud_cover,rain,snowfall,apparent_temperature&current=snowfall,cloud_cover,wind_speed_10m,showers,rain,precipitation,temperature_2m,relative_humidity_2m,apparent_temperature`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    console.log(data);
    ///////////////
    const iconWeather = function (weather) {
      if (weather.rain > 30 || weather.showers > 0) {
        return "assets/images/icon-rain.webp";
      } else if (weather.cloud_cover > 30) {
        return "assets/images/icon-partly-cloudy.webp";
      } else if (weather.snowfall > 30) {
        return "assets/images/icon-snow.webp";
      } else {
        return "assets/images/icon-sunny.webp";
      }
    };
    ///////////////
    const currentTemp = data.current?.temperature_2m;
    const hourly = data.hourly;
    console.log("Current Temperature:", currentTemp + "°C");
    ///////hero
    hero.querySelector("img").src = iconWeather(data.current);
    curTemp.textContent = currentTemp + "°C";
    date.textContent = data.current.time.slice(0, -6);
    ////////////others
    feels.textContent = data.current.apparent_temperature + "°C";
    wind.textContent =
      data.current.wind_speed_10m + data.current_units.wind_speed_10m;
    humidity.textContent =
      data.current.relative_humidity_2m +
      data.current_units.relative_humidity_2m;
    perci.textContent =
      data.current.precipitation + data.current_units.precipitation;
    //////////////hourly
    hourList.innerHTML = "";
    for (let i = 1; i < 12 && i < hourly.temperature_2m.length; i++) {
      const weatherObj = {
        rain: data.hourly.rain ? data.hourly.rain[i] : 0,

        cloud_cover: data.hourly.cloud_cover ? data.hourly.cloud_cover[i] : 0,
        snowfall: data.hourly.snowfall ? data.hourly.snowfall[i] : 0,
        showers: 0,
      };
      html = ` <li class="hour-fore">
              <img src="${iconWeather(weatherObj)}" />
              <p class="time">${hourly.time[i].slice(11)}</p>
              <p class="temperature">${Math.trunc(hourly.temperature_2m[i])} ${
        data.hourly_units.temperature_2m
      }
             </p>
            </li>`;
      hourList.insertAdjacentHTML("beforeend", html);
    }
    //////daily
    for (let i = 0; i <= 6; i++) {
      const weatherObj = {
        rain: data.daily.rain_sum?.[i] || 0,
        snowfall: data.daily.snowfall_sum?.[i] || 0,
        cloud_cover: data.daily.cloud_cover_mean?.[i] || 0,
        showers: data.daily.showers_sum?.[i] || 0,
      };

      if (!day[i]) continue;

      day[i].querySelector(".day-img").src = iconWeather(weatherObj);

      if (dayMax[i])
        dayMax[i].textContent =
          Math.round(data.daily.temperature_2m_max?.[i] || 0) + "°";
      if (dayMin[i])
        dayMin[i].textContent =
          Math.round(data.daily.temperature_2m_min?.[i] || 0) + "°";
    }

    //////////////
    console.log(data);
    return data;
  } catch (error) {
    console.error("⛔ Error fetching weather data", error.message);
  }
}

const errorApi = function () {
  setTimeout(() => {
    othersSection.textContent = "";
    hourSection.textContent = "";
    dailySection.textContent = "";
  }, 10000);
};

async function dailyWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m`;
  try {
    const res = await fetch(url);
    const data = await res.json();
  } catch {
    console.error("💥💥💥💥💥💥💥💥");
  }
}
