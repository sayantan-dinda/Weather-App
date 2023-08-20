const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const weatherCardsDiv = document.querySelector(".weather-cards");
const currentWeatherDiv = document.querySelector(".current-weather");

locationButton.addEventListener("click", () => {
  //get cordinates
  navigator.geolocation.getCurrentPosition(
    (position) => {
      console.log("Current position", position);
      const { latitude, longitude } = position.coords;

      //get city name of user coordinates using openweathermap reverse geocoding api
      const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
      //Fetch Weather using reverse geocoding api
      fetch(REVERSE_GEOCODING_URL)
        .then((res) => res.json())
        .then((data) => {
          //console geo cordinate city,lon,lat
          console.log("using current location geo cordinate", data);

          //destructuring for get name ,latitude and longitude
          const { name } = data[0];

          //for geting weather details call function getWeatherDetails
          getWeatherDetails(name, latitude, longitude);
        })
        .catch((error) => {
          console.log("Something went wrong while fetching the city", error);
        });
    },
    (error) => {
      console.log("error on clicking use current location: ", error);
      switch (error.code) {
        case error.PERMISSION_DENIED:
          alert("User denied the request for Geolocation.");
          break;
        case error.POSITION_UNAVAILABLE:
          alert("Location information is unavailable.");
          break;
        case error.TIMEOUT:
          alert("The request to get user location timed out.");
          break;
        case error.UNKNOWN_ERROR:
          alert("An unknown error occurred.");
          break;
      }
    }
  );
});

//API KEY -> https://home.openweathermap.org/api_keys
const API_KEY = "37ecf82ea36e0c3c28078433cbdd4900";

const createWeatherCard = (cityName, weatherItem, index) => {
  //recent forecast display on main div
  //HTML for main weather card
  if (index === 0) {
    return ` <div class="details">
              <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
              <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
              <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
              <h4>Humidity: ${weatherItem.main.humidity}%</h4>
          </div>
          <div class="icon">
            <img
              src="https://openweathermap.org/img/wn/${
                weatherItem.weather[0].icon
              }@4x.png"
              alt="weather-data"
            />
            <h4>${weatherItem.weather[0].description}</h4>
          </div>`;
  } else {
    //HTML for other 6 forcast card
    return `<li class="cards">
                <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                <img
                  src="https://openweathermap.org/img/wn/${
                    weatherItem.weather[0].icon
                  }@2x.png"
                  alt="weather-data"
                />
                <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                <h4>Humidity: ${weatherItem.main.humidity}%</h4>
              </li>`;
  }
};

//Get Weather details
//api returns forecast after a gap of 3 hours
const getWeatherDetails = (cityname, lat, lon) => {
  const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  //fetching weather data from url
  fetch(WEATHER_API_URL)
    .then((res) => res.json())
    .then((data) => {
      console.log("weather", data);

      //Filter the forecasts to get only one forecast per day
      const uniqueForecastDays = [];
      const fiveDaysForecast = data.list.filter((forecast) => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          return uniqueForecastDays.push(forecastDate);
        }
      });

      //clearing previous weather data
      cityInput.value = "";
      weatherCardsDiv.innerHTML = "";
      currentWeatherDiv.innerHTML = "";

      console.log("five days forecast:", fiveDaysForecast);

      //show five days forecast
      //Creating weather card and adding them to the DOM
      fiveDaysForecast.forEach((weatherItem, index) => {
        const html = createWeatherCard(cityname, weatherItem, index);
        if (index === 0) {
          currentWeatherDiv.insertAdjacentHTML("beforeend", html);
        } else {
          weatherCardsDiv.insertAdjacentHTML("beforeend", html);
        }
      });
    })
    .catch((error) => {
      console.log(
        "Something went wrong while fetching weather forecast: ",
        error
      );
    });
};

//click search -> get coordinate
searchButton.addEventListener("click", () => {
  const cityName = cityInput.value.trim();

  //if cityName empty return
  if (!cityName) {
    return;
  }

  console.log(cityName);

  //City coordinates using OpenWeatherMap. API -> https://openweathermap.org/api/geocoding-api
  const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  //Fetch Weather
  fetch(GEOCODING_API_URL)
    .then((res) => res.json())
    .then((data) => {
      //console geo cordinate
      console.log("geo cordinate", data);

      if (!data.length) {
        return alert(`No coordinate found for ${cityName}`);
      }

      //destructuring for get name ,latitude and longitude
      const { name, lat, lon } = data[0];

      //for geting weather details call function getWeatherDetails
      getWeatherDetails(name, lat, lon);
    })
    .catch((error) => {
      console.log(
        "Something went wrong while fetching geo coordinate forecast: ",
        error
      );
    });
});

//get city coordinate
const getCityCoordinates = () => {
  const cityName = cityInput.value.trim();
  if (cityName === "") return;
  const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  // Get entered city coordinates (latitude, longitude, and name) from the API response
  fetch(API_URL)
    .then((response) => response.json())
    .then((data) => {
      if (!data.length) return alert(`No coordinates found for ${cityName}`);
      const { lat, lon, name } = data[0];
      getWeatherDetails(name, lat, lon);
    })
    .catch(() => {
      alert("An error occurred while fetching the coordinates!");
    });
};

//autometically triggers when someone opens the page
locationButton.click();

//show weather data on enter click
cityInput.addEventListener("keyup", (e) => {
  //If pressedkey is enter then call the getcitycoordinates function
  return e.key === "Enter" && getCityCoordinates();
});
