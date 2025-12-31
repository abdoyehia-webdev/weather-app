const searchInput = document.querySelector(".search-input");

const API_KEY = `aa72de42f6f04a90a1c180713231508`;

const weatherCodes = {
  clear: [1000],
  clouds: [1003, 1006, 1009],
  mist: [1030, 1135, 1147],
  rain: [
    1063, 1150, 1153, 1168, 1171, 1180, 1183, 1198, 1201, 1240, 1243, 1246,
    1273, 1276,
  ],
  moderate_heavy_rain: [1186, 1189, 1192, 1195, 1243, 1246],
  snow: [
    1066, 1069, 1072, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222,
    1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264, 1279, 1282,
  ],
  thunder: [1087, 1279, 1282],
  thunder_rain: [1273, 1276],
};

const getHourlyData = (hours) => {
  const currentHour = new Date().setMinutes(0, 0, 0);

  const next24Hours = currentHour + 24 * 60 * 60 * 1000;

  const data = hours.filter(({ time }) => {
    const current = new Date(time).getTime();
    return current >= currentHour && current <= next24Hours;
  });

  document.querySelector(".weather-list").innerHTML = data
    .map((element) => {
      const temp = Math.floor(element.temp_c);

      const time = element.time.split(" ")[1];

      const icon = Object.keys(weatherCodes).find((ele) =>
        weatherCodes[ele].includes(element?.condition?.code)
      );

      return `
     <li class="weather-item">
              <p class="time">${time}</p>
              <img src="icons/${icon}.svg" class="weather-icon" />
              <p class="temperature">${temp}°</p>
            </li>
    
    `;
    })
    .join("");
};

const getWeatherDetails = async (baseUrl) => {
  try {
    const response = await fetch(baseUrl);
    const data = await response.json();

    if (!response.ok) throw new Error(data.error.message);

    const temp = data.current.temp_c;
    const description = data.current.condition.text;

    document.querySelector(".temperature").innerHTML = `${temp}<span>C</span>`;
    document.querySelector(".description").innerHTML = `${description}`;

    const icon = Object.keys(weatherCodes).find((ele) =>
      weatherCodes[ele].includes(data?.current?.condition.code)
    );

    document.querySelector(".weather-icon").src = `/icons/${icon}.svg`;

    const twoDaysHours = [
      ...data?.forecast?.forecastday[0]?.hour,
      ...data?.forecast?.forecastday[1]?.hour,
    ];

    searchInput.value = data.location.name;
    getHourlyData(twoDaysHours);
  } catch (err) {
    console.log(err);
  }
};

const setupWeatherRequest = (cityName) => {
  const BASE_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${cityName}&days=2`;

  getWeatherDetails(BASE_URL);
};

const getUserInput = (e) => {
  const cityName = searchInput.value;
  if (e.key === "Enter" && cityName) {
    setupWeatherRequest(cityName);
  }
};

document.querySelector(".location-button").addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition((position) => {
    console.log(position.coords);
    const { latitude, longitude } = position.coords;
    const BASE_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${latitude},${longitude}&days=2`;
    getWeatherDetails(BASE_URL);
  });
});

searchInput.addEventListener("keyup", (e) => getUserInput(e));
setupWeatherRequest("LONDON");
