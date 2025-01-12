document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form");
  const clearButton = document.getElementById("clearButton");
  const submitButton = document.getElementById("submitButton");
  const checkBox = document.getElementById("checkBox");
  const weatherCard = document.getElementById("weatherCard");
  const chartContainer = document.getElementById("weatherChart");
  const hourlyChartContainer = document.getElementById("hourlyWeatherChart");

  const weatherStatusCodes = {
    1000: {
      weatherStatus: "Clear, Sunny",
      img: "/static/images/WeatherSymbolsforWeatherCodes/clear_day.svg",
    },
    1100: {
      weatherStatus: "Mostly Clear",
      img: "/static/images/WeatherSymbolsforWeatherCodes/mostly_clear_day.svg",
    },
    1101: {
      weatherStatus: "Partly Cloudy",
      img: "/static/images/WeatherSymbolsforWeatherCodes/partly_cloudy_day.svg",
    },
    1102: {
      weatherStatus: "Mostly Cloudy",
      img: "/static/images/WeatherSymbolsforWeatherCodes/mostly_cloudy.svg",
    },
    1001: {
      weatherStatus: "Cloudy",
      img: "/static/images/WeatherSymbolsforWeatherCodes/cloudy.svg",
    },
    2000: {
      weatherStatus: "Fog",
      img: "/static/images/WeatherSymbolsforWeatherCodes/fog.svg",
    },
    2100: {
      weatherStatus: "Light Fog",
      img: "/static/images/WeatherSymbolsforWeatherCodes/fog_light.svg",
    },
    4000: {
      weatherStatus: "Drizzle",
      img: "/static/images/WeatherSymbolsforWeatherCodes/drizzle.svg",
    },
    4001: {
      weatherStatus: "Rain",
      img: "/static/images/WeatherSymbolsforWeatherCodes/rain.svg",
    },
    4200: {
      weatherStatus: "Light Rain",
      img: "/static/images/WeatherSymbolsforWeatherCodes/rain_light.svg",
    },
    4201: {
      weatherStatus: "Heavy Rain",
      img: "/static/images/WeatherSymbolsforWeatherCodes/rain_heavy.svg",
    },
    5000: {
      weatherStatus: "Snow",
      img: "/static/images/WeatherSymbolsforWeatherCodes/snow.svg",
    },
    5001: {
      weatherStatus: "Flurries",
      img: "/static/images/WeatherSymbolsforWeatherCodes/flurries.svg",
    },
    5100: {
      weatherStatus: "Light Snow",
      img: "/static/images/WeatherSymbolsforWeatherCodes/snow_light.svg",
    },
    5101: {
      weatherStatus: "Heavy Snow",
      img: "/static/images/WeatherSymbolsforWeatherCodes/snow_heavy.svg",
    },
    6000: {
      weatherStatus: "Freezing Drizzle",
      img: "/static/images/WeatherSymbolsforWeatherCodes/freezing_drizzle.svg",
    },
    6001: {
      weatherStatus: "Freezing Rain",
      img: "/static/images/WeatherSymbolsforWeatherCodes/freezing_rain.svg",
    },
    6200: {
      weatherStatus: "Light Freezing Rain",
      img: "/static/images/WeatherSymbolsforWeatherCodes/freezing_rain_light.svg",
    },
    6201: {
      weatherStatus: "Heavy Freezing Rain",
      img: "/static/images/WeatherSymbolsforWeatherCodes/freezing_rain_heavy.svg",
    },
    7000: {
      weatherStatus: "Ice Pellets",
      img: "/static/images/WeatherSymbolsforWeatherCodes/ice_pellets.svg",
    },
    7101: {
      weatherStatus: "Heavy Ice Pellets",
      img: "/static/images/WeatherSymbolsforWeatherCodes/ice_pellets_heavy.svg",
    },
    7102: {
      weatherStatus: "Light Ice Pellets",
      img: "/static/images/WeatherSymbolsforWeatherCodes/ice_pellets_light.svg",
    },
    8000: {
      weatherStatus: "Thunderstorm",
      img: "/static/images/WeatherSymbolsforWeatherCodes/tstrom.svg",
    },
  };

clearButton.addEventListener("click", (e) => {
    e.preventDefault();
    form.reset();  
    sessionStorage.clear(); 
    weatherCard.style.display = "none";
    chartContainer.style.display = "none";
    hourlyChartContainer.style.display = "none";
    noRecordsFound.style.display = "none";
    document.getElementById("detailedWeather").style.display = "none";
    document.getElementById("weatherTable").style.display = "none";

    checkBox.checked = false;
    const formFields = form.querySelectorAll("input, select, textarea");
    formFields.forEach((field) => {
        field.disabled = false; 
    });
    submitButton.disabled = true;  
});

checkBox.addEventListener("change", (e) => {
    e.preventDefault();
    const formFields = form.querySelectorAll("input, select, textarea");
    
    if (checkBox.checked) {
        submitButton.disabled = false; 
        formFields.forEach((field) => {
            if (field !== checkBox) {
                field.disabled = true;  
                field.value = "";  
            }
        });
        console.log("Using ioInfo API");
    } else {
        submitButton.disabled = true;
        formFields.forEach((field) => {
            field.disabled = false; 
        });
    }
});

form.addEventListener("input", () => {
    const streetValue = document.getElementById("streetName").value;
    const cityValue = document.getElementById("cityName").value;
    const stateValue = document.getElementById("select-state").value;


    if (streetValue && cityValue && stateValue) {
        submitButton.disabled = false;
    } else {
        submitButton.disabled = true;
    }
});

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("hi");
    const streetValue = document.getElementById("streetName").value;
    const cityValue = document.getElementById("cityName").value;
    const stateValue = document.getElementById("select-state").value;


    if (checkBox.checked) {
        getLocation();  
    } else {

    console.log("Street:", streetValue);
    console.log("City:", cityValue);
    console.log("State:", stateValue);
    await getFormattedAddress(streetValue, cityValue, stateValue);
    }

  });


  noRecordsFound.style.display = "none";

  function displayNoRecordsFound() {
    const noRecordsFound = document.getElementById("noRecordsFound");
    noRecordsFound.style.display = "block";
    noRecordsFound.innerHTML = '<p  id="noRecordTextMessage" >No records have been found.</p>';
  }


  async function getLocation() {
    const accessToken = "26239f0f1980e6"; 

    try {
      const response = await fetch(
        `https://ipinfo.io/json?token=${accessToken}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      const [latitude, longitude] = data.loc.split(","); 
      const city = data.city;
      const region = data.region;
      const country = data.country; 

      const currentLocation = `${city}, ${region}`;
      console.log("Latitude:", latitude, "Longitude:", longitude);
      console.log("Current Location:", currentLocation);

      getWeathercoordinates(latitude, longitude, currentLocation);
    } catch (error) {
      console.error("Error fetching location data:", error);
    }
  }

  async function getFormattedAddress(street_value, city_value, state_value) {
    const apiKey = "AIzaSyDWZuWReQXAFCFu-fTwPb15ThgcQoslQEc";
    const address = `${street_value}, ${city_value}, ${state_value}`;

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${apiKey}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const formattedAddress = data.results[0].formatted_address;
        const latitude = data.results[0].geometry.location.lat;
        const longitude = data.results[0].geometry.location.lng;

        console.log("Formatted Address:", formattedAddress);
        console.log("Latitude:", latitude);
        console.log("Longitude:", longitude);

        getWeathercoordinates(latitude, longitude, formattedAddress);
      } else {
        console.log("No results found");
      }
    } catch (error) {
      console.error("Error fetching geocode data:", error);
    }
  }

  function getWeathercoordinates(latitude, longitude, location) {
    const url = `/get_weather?latitude=${latitude}&longitude=${longitude}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);

        const cardValues = data.data.timelines[0].intervals[0].values;
        const temperature = cardValues.temperature;
        const humidity = cardValues.humidity;
        const windSpeed = cardValues.windSpeed;
        const pressure = cardValues.pressureSeaLevel;
        const uvIndex = cardValues.uvIndex;
        const cloudCover = cardValues.cloudCover;
        const visibility = cardValues.visibility;
        const weatherCode = cardValues.weatherCode;

        console.log("Location:", location);
        console.log("Temperature:", temperature);
        console.log("Humidity:", humidity);
        console.log("Wind Speed:", windSpeed);
        console.log("Pressure:", pressure);
        console.log("UV Index:", uvIndex);
        console.log("Cloud Cover:", cloudCover);

        displayWeatherData(
          location,
          temperature,
          humidity,
          windSpeed,
          pressure,
          uvIndex,
          cloudCover,
          visibility,
          weatherCode
        );
        displayWeatherTable(data);
      })
      .catch((error) => {
        console.error("Error fetching weather data:", error);
        displayNoRecordsFound();
      });
  }

  function displayWeatherData(
    location,
    temperature,
    humidity,
    windSpeed,
    pressure,
    uvIndex,
    cloudCover,
    visibility,
    weatherCode
  ) {
    const weatherInfo = weatherStatusCodes[weatherCode] || {
      weatherStatus: "Unknown",
      img: "/static/images/WeatherSymbolsforWeatherCodes/unknown.svg",
    };
    weatherCard.style.display = "block";
    weatherCard.innerHTML = `
            <div class="mainContainer">
                <div class="addressContainer">
                    <p id="addressLine">${location}</p>
                </div>
                    <div class="imageContainer">
                        <img id="weatherImage" src="${weatherInfo.img}" alt="${weatherInfo.weatherStatus}">
                        <p id="degree">${temperature}&deg;</p>
                    </div>
                    <div class="taglineContainer">
                        <p id="weatherStatus">${weatherInfo.weatherStatus}</p>
                    </div>
                <div class="weatherInfoContainer">
                    <div class="humidity">
                        <p id="weatherParameters" >Humidity</p>
                        <img id="icons" src="static/images/humidity.png">
                        <p id="paramValues">${humidity}%</p>
                    </div>
                    <div class="pressure">
                        <p id="weatherParameters" >Pressure</p>
                        <img id="icons" src="static/images/Pressure.png">
                        <p id="paramValues">${pressure}inHg</p>
                    </div>
                    <div class="windspeed">
                        <p id="weatherParameters" >WindSpeed</p>
                        <img id="icons" src="static/images/Wind_Speed.png">
                        <p id="paramValues">${windSpeed}mph</p>
                    </div>
                    <div class="visibility">
                        <p id="weatherParameters" >Visibility</p>
                        <img id="icons" src="static/images/Visibility.png">
                        <p id="paramValues">${visibility}mi</p>
                    </div>
                    <div class="cloudcover">
                        <p id="weatherParameters" >Cloud Cover</p>
                        <img id="icons" src="static/images/Cloud_Cover.png">
                        <p id="paramValues">${cloudCover}%</p>
                    </div>
                    <div class="uvlevel">
                        <p id="weatherParameters" >UV Level</p>
                        <img id="icons" src="static/images/UV_Level.png">
                        <p id="paramValues">${uvIndex}</p>
                    </div>
                </div>
            </div>
            `;
  }

  function displayWeatherTable(data) {
    const weatherTable = document.getElementById("weatherTable");
    weatherTable.style.display = "block";
    weatherTable.innerHTML = "";

    const mainTable = document.createElement("table");
    mainTable.classList.add("weeklyWeatherTable");

    const tableHeader = document.createElement("thead");
    tableHeader.innerHTML = `
                <tr id="tableHeader">
                    <th>Date</th>
                    <th>Status</th>
                    <th>Temp High</th>
                    <th>Temp Low</th>
                    <th>Wind Speed</th>
                </tr>
            `;
    mainTable.appendChild(tableHeader);

    const tableBody = document.createElement("tbody");
    const dailyWeather = data.data.timelines[0].intervals;

    dailyWeather.forEach((interval, index) => {
      console.log("Interval", interval);
      const values = interval.values;
      if (!values) return;

      const weatherCode = values.weatherCode;

      const eachDate = new Date(interval.startTime).toLocaleDateString(
        "en-GB",
        {
          weekday: "long",
          month: "short",
          day: "2-digit",
          year: "numeric",
        }
      );

      const tableRows = document.createElement("tr");
      tableRows.innerHTML = `
                    <td>${eachDate}</td>
                    <td><img src="${weatherStatusCodes[weatherCode].img}" alt="${weatherStatusCodes[weatherCode].weatherStatus}"> ${weatherStatusCodes[weatherCode].weatherStatus}</td>
                    <td>${values.temperatureMax}</td>
                    <td>${values.temperatureMin}</td>
                    <td>${values.windSpeed}</td>
                `;

      tableRows.addEventListener("click", () => {
        displayDetailedWeather(interval, index, data);
      });

      tableBody.appendChild(tableRows); 
    });

    mainTable.appendChild(tableBody); 
    weatherTable.appendChild(mainTable); 
  }

  function displayDetailedWeather(interval, index, data) {
    const values = interval.values;
    const weatherCode = values.weatherCode;

    const intervals = data.data.timelines[0].intervals;
    const temperatureMin = intervals.map(
      (interval) => interval.values.temperatureMin
    );
    const temperatureMax = intervals.map(
      (interval) => interval.values.temperatureMax
    );
    const weekdays = intervals.map((interval) =>
      new Date(interval.startTime).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
      })
    );
    const latitude = data.data.timelines[0].intervals[0].values.latitude;
    const longitude = data.data.timelines[0].intervals[0].values.longitude;
    const apiKey = "wQvcUl8ejaH6q0mHXuvskaFPsyFY9Ibj";

    const Precipitation = values.precipitationType;
    const chanceOfRain = values.precipitationProbability;
    const windSpeed = values.windSpeed;
    const humidity = values.humidity;
    const visibility = values.visibility;
    const sunrise = new Date(values.sunriseTime).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).replace(" ", "");
    const sunset = new Date(values.sunsetTime).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).replace(" ", "");
    const weatherDate = new Date(interval.startTime).toLocaleDateString(
      "en-GB",
      {
        weekday: "long",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

    if (Precipitation == "0") {
      precipitationFormatted = "N/A";
    } else if (Precipitation == "1") {
      precipitationFormatted = "Rain";
    } else if (Precipitation == "2") {
      precipitationFormatted = "Snow";
    } else if (Precipitation == "3") {
      precipitationFormatted = "Freezing Rain";
    } else {
      precipitationFormatted = "Ice Pellets";
    }

    const highTemp = values.temperatureMax;
    const lowTemp = values.temperatureMin;
    weatherTable.style.display = "none";
    weatherCard.style.display = "none";

    let detailedDiv = document.getElementById("detailedWeather");
    if (!detailedDiv) {
      detailedDiv = document.createElement("div");
      detailedDiv.id = "detailedWeather";
      document.body.appendChild(detailedDiv); 
    }

    const weatherInfo = weatherStatusCodes[weatherCode] || {
      weatherStatus: "Unknown",
      img: "/static/images/WeatherSymbolsforWeatherCodes/unknown.svg",
    };

    detailedDiv.innerHTML = `
                            <p id="weather-header">Daily Weather Details</p>
                            <hr id="hr_weatherdetails1">
                    <div class="detailedWeather">
                    <div class="dateStatusImageContainer">
                    <div class="dateContainer">
                        <p id="date">${weatherDate}</p>
                        <p id="weatherType">${weatherStatusCodes[weatherCode].weatherStatus}</p>
                        <p id="highlowTemp">${highTemp}&degF/${lowTemp}&degF</p>
                    </div>
                    <div class="weatherIconImage">
                        <img id="weatherDetailsImage" src="${weatherStatusCodes[weatherCode].img}">
                    </div>
                </div>

                <div class="weatherDetailsContainer">
                    <div class="detailedwathercardTable">
                        <div class="columnOne">Precipitation:</div>
                        <div class="columnTwo">${precipitationFormatted}</div>
                    </div>
                    <div class="detailedwathercardTable">
                        <div class="columnOne">Chance of Rain:</div>
                        <div class="columnTwo">${chanceOfRain}%</div>
                    </div>
                    <div class="detailedwathercardTable">
                        <div class="columnOne">Precipitation:</div>
                        <div class="columnTwo">${windSpeed} mph</div>
                    </div>
                    <div class="detailedwathercardTable">
                        <div class="columnOne">Humidity:</div>
                        <div class="columnTwo">${humidity}%</div>
                    </div>
                    <div class="detailedwathercardTable">
                        <div class="columnOne">Visibility:</div>
                        <div class="columnTwo">${visibility} mi</div>
                    </div>
                    <div class="detailedwathercardTable">
                        <div class="columnOne">Sunrise/Sunset:</div>
                        <div class="columnTwo">${sunrise}/${sunset}</div>
                    </div>

                </div>
            </div>

            <div class="weatherChartsFooterContainer"> 
                <p id="weather-footer">Weather Charts</p>
                <hr id="hr_weatherdetails2">
                <button id="buttonDownArrow"> <img id='arrowImage' src="static/images/point-down-512.png" alt="Down Arrow"></button>
            </div>

            `;

    detailedDiv.style.display = "block";
    document.getElementById("buttonDownArrow").addEventListener("click", () => {
      const arrowImage = document.getElementById("arrowImage"); 
      
      requestAnimationFrame(() => {
        document.getElementById("buttonDownArrow").scrollIntoView({ behavior: "smooth", block: "start" });
      });

      if (
        chartContainer.style.display === "none" ||
        chartContainer.style.display === ""
      ) {
        chartContainer.style.display = "flex";
        hourlyChartContainer.style.display = "flex";
        arrowImage.src = "static/images/point-up-512.png"; 
        displayWeatherCharts(temperatureMin, temperatureMax, weekdays);
        displayHourlyWeatherChart(data);
      } else {
        chartContainer.style.display = "none";
        hourlyChartContainer.style.display = "none";
        arrowImage.src = "static/images/point-down-512.png"; 
      }
    });
  }

function displayWeatherCharts(temperatureMin, temperatureMax, weekdays) {
    
    const nextDayTemperatureMin = temperatureMin.slice(1);
    const nextDayTemperatureMax = temperatureMax.slice(1);
    const nextDayWeekdays = weekdays.slice(1);
    const temperatureValuesContainer = document.getElementById("weatherChart");
    let temperatureHTML = "<h3>Temperature Values:</h3><ul>";
  
    for (let i = 0; i < nextDayTemperatureMin.length; i++) {
      temperatureHTML += `<li>Day ${i + 2}: Min ${nextDayTemperatureMin[i]}°C, Max ${
        nextDayTemperatureMax[i]
      }°C</li>`;
    }
  
    temperatureHTML += "</ul>";
    temperatureValuesContainer.innerHTML = temperatureHTML;
    let temperatureData = [];
    for (let i = 0; i < nextDayTemperatureMin.length - 1; i++) {
      temperatureData.push([nextDayTemperatureMin[i], nextDayTemperatureMax[i]]);
    }
    Highcharts.chart("weatherChart", {
      chart: {
        type: "arearange",
        zoomType: "x",
      },
      title: {
        text: "Temperature Ranges (Min, Max)",
        style: {
          fontWeight: "bold",
        },
      },
      xAxis: {
        categories: nextDayWeekdays, 
        tickInterval: 1,
        tickmarkPlacement: "on",
        tickWidth: 1,
        tickLength: 10,
        tickPositions: [0, 1, 2, 3, 4, 5],
        crosshair: {
            width: 0.5,
            color: "rgba(0, 0, 0, 0.3)",
            dashStyle: "solid",
        },
      },
      yAxis: {
        title: {
          text: null,
        },
      },
      tooltip: {
        shared: true,
        backgroundColor: "white",
        borderColor: "black",
        borderRadius: 5,
        shadow: true,
        crosshairs: {
          width: 0.5,
          color: "grey",
          dashStyle: "solid",
        },
        valueSuffix: "°F",
        formatter: function () {
          const dayLabel = this.x;
          const currentDate = new Date(this.x + " " + new Date().getFullYear());
          const options = { weekday: "long" };
          const dayOfWeek = currentDate.toLocaleDateString("en-US", options);
  
          return (
            `${dayOfWeek}, ${dayLabel}<br/>` +
            `<span style="color:rgb(87,172,246);">●</span>Temperatures: <strong>${this.points[0].point.low.toFixed(
              2
            )}°F - ${this.points[0].point.high.toFixed(2)}°F</strong>`
          );
        },
      },
      plotOptions: {
        series: {
            pointPlacement: "between",
        },
        arearange: {
          marker: {
            enabled: true,
            radius: 4,
          },
          lineWidth: 2, 
        },
      },
      series: [
        {
          name: "Temperature Range",
          data: temperatureData, 
          lineColor: "rgb(236,180,94)", 
          lineWidth: 1,
          color: "rgb(87,172,246)", 
          fillColor: {
            linearGradient: [0, 0, 0, 300],
            stops: [
              [0, "rgba(238,170,68,0.8)"], 
              [1, "rgba(30,144,255,0.5)"], 
            ],
          },
        },
      ],
      legend: {
        enabled: false,
        layout: "horizontal",
        align: "right",
        verticalAlign: "bottom",
        floating: true,
        borderWidth: 0,
        backgroundColor:
          Highcharts.defaultOptions.legend.backgroundColor || "#FFFFFF",
      },
    });
  }
  
  function displayHourlyWeatherChart(data) {
    function Meteogram(json, container) {
      this.humidity = [];
      this.winds = [];
      this.temperatures = [];
      this.pressures = [];

      this.json = json;
      this.container = container;

      this.parseHourlyDataMeteo();
    }

    Meteogram.prototype.drawBlocksForWindArrows = function (chart) {
      const xAxis = chart.xAxis[0];

      for (
        let pos = xAxis.min, max = xAxis.max, i = 0;
        pos <= max + 36e5;
        pos += 36e5, i += 1
      ) {

        const isLast = pos === max + 36e5,
          x = Math.round(xAxis.toPixels(pos)) + (isLast ? 0.5 : -0.5);

        const isLong =
          this.resolution > 36e5 ? pos % this.resolution === 0 : i % 2 === 0;

        chart.renderer
          .path([
            "M",
            x,
            chart.plotTop + chart.plotHeight + (isLong ? 0 : 28),
            "L",
            x,
            chart.plotTop + chart.plotHeight + 32,
            "Z",
          ])
          .attr({
            stroke: chart.options.chart.plotBorderColor,
            "stroke-width": 1,
          })
          .add();
      }

      // Center items in block
      chart.get("windbarbs").markerGroup.attr({
        translateX: chart.get("windbarbs").markerGroup.translateX + 8,
      });
    };

    Meteogram.prototype.getChartOptions = function () {
      return {
        chart: {
          renderTo: this.container,
          marginBottom: 70,
          marginRight: 40,
          marginTop: 65,
          plotBorderWidth: 1,
          height: 350,
          alignTicks: false,
          scrollablePlotArea: {
            minWidth: 720,
          },
        },

        title: {
          text: "Hourly Weather (For Next 5 Days)",
          align: "center",
          style: {
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          },
        },

        credits: {
          text: "Forecast",
          position: {
            x: -40,
          },
        },

        tooltip: {
          shared: true,
          useHTML: true,
          headerFormat:
            "<small>{point.x:%A, %b %e, %H:%M}  " +
            "{point.point.to:%H:%M}</small><br>" ,
            // "<b>{point.point.symbolName}</b><br>",
        },

        xAxis: [
          {
            type: "datetime",
            tickInterval: 6 * 36e5, 
            minorTickInterval: 36e5, 
            tickLength: 0,
            gridLineWidth: 1,
            gridLineColor: "rgba(128, 128, 128, 0.1)",
            startOnTick: false,
            endOnTick: false,
            minPadding: 0,
            maxPadding: 0,
            offset: 25,
            showLastLabel: true,
            labels: {
              format: "{value:%H}",
            },
            crosshair: true,
          },
          {
            linkedTo: 0,
            type: "datetime",
            tickInterval: 24 * 3600 * 1000,
            labels: {
              format:
                '{value:<span style="font-size: 12px; font-weight: ' +
                'bold">%a</span> %b %e}',
              align: "left",
              x: 0,
              y: -10,
            },
            opposite: true,
            tickLength: 20,
            gridLineWidth: 1,
          },
        ],

        yAxis: [
          {
            title: {
              text: null,
            },
            labels: {
              format: "{value}°",
              style: {
                fontSize: "10px",
              },
              x: -3,
            },
            plotLines: [
              {
                value: 0,
                color: "#BBBBBB",
                width: 1,
                zIndex: 2,
              },
            ],
            maxPadding: 0,
            minRange: 7,
            tickInterval: 7,
            gridLineColor: "rgba(128, 128, 128, 0.1)",
          },
          {
            title: {
              text: null,
            },
            labels: {
              enabled: false,
            },
            gridLineWidth: 0,
            tickLength: 0,
            minRange: 10,
            min: 0,
          },
          {
            allowDecimals: false,
            title: {
              text: "inHg",
              offset: 0,
              align: "high",
              rotation: 0,
              style: {
                fontSize: "10px",
                color: "orange",
              },
              textAlign: "left",
              x: 3,
            },
            labels: {
              style: {
                fontSize: "8px",
                color: "orange",
              },
              y: 2,
              x: 3,
              formatter: function () {
                return Math.round(this.value);
              },
            },
            gridLineWidth: 0,
            opposite: true,
            showLastLabel: false,
          },
        ],

        legend: {
          enabled: false,
        },

        plotOptions: {
          series: {
            pointPlacement: "between",
          },
        },

        series: [
          {
            name: "Temperature",
            data: this.temperatures,
            type: "spline",
            marker: {
              enabled: false,
              states: {
                hover: {
                  enabled: true,
                },
              },
            },
            tooltip: {
              pointFormat:
                '<span style="color:{point.color}">\u25CF</span>'  +
                "{series.name}: <b>{point.y}°F</b><br/>",
            },
            zIndex: 1,
            color: "#FF3333",
            negativeColor: "#48AFE8",
          },
          {
            name: "Humidity",
            data: this.humidity,
            type: "column",
            color: "rgba(68, 170, 213, 0.7)",
            yAxis: 1,
            groupPadding: 0,
            pointPadding: 0,
            tooltip: {
              valueSuffix: " %",
              pointFormat:
                '<span style="color:{point.color}">\u25CF</span>' +
                "{series.name}: <b>{point.y}" +
                "</b><br/>",
            },
            grouping: false,
            dataLabels: {
              enabled: true, 
              style: {
                color: "gray",
                fontWeight: "bold",
                textOutline: "1px contrast",
                fontSize: "9px",
              },
              formatter: function () {
                return Math.floor(this.y);
              }, 
            },
          },
          {
            name: "Air pressure",
            color: "orange",
            data: this.pressures,
            marker: {
              enabled: false,
            },
            shadow: false,
            tooltip: {
              valueSuffix: " inHg",
            },
            dashStyle: "ShortDash",
            yAxis: 2,
            formatter: function () {
              return Math.floor(this.y);
            },
          },
          {
            name: "Wind",
            type: "windbarb",
            id: "windbarbs",
            color: Highcharts.getOptions().colors[1],
            lineWidth: 1.5,
            data: this.winds,
            vectorLength: 10,
            yOffset: -18,
            tooltip: {
              valueSuffix: " mph",
              valueDecimals: 2,
            },
          },
        ],
      };
    };

    Meteogram.prototype.onChartLoad = function (chart) {
      this.drawBlocksForWindArrows(chart);
    };

    Meteogram.prototype.createChart = function () {
      this.chart = new Highcharts.Chart(this.getChartOptions(), (chart) => {
        this.onChartLoad(chart);
      });
    };

    Meteogram.prototype.parseHourlyDataMeteo = function () {
      let pointStart;

      if (!this.json) {
        return this.error();
      }

      this.json.data.timelines[1].intervals.forEach((interval, i) => {
        const x = Date.parse(interval.startTime),
          nextHours = interval.values,
          symbolCode = null,
          to = x + 36e5;

        if (to > pointStart + 48 * 36e5) {
          return;
        }

        this.temperatures.push({
          x,
          y: Math.floor(nextHours.temperature),
          to,
        });

        this.humidity.push({
          x,
          y: Math.floor(nextHours.humidity),
        });

        if (i % 2 === 0) {
          this.winds.push({
            x,
            value: nextHours.windSpeed,
            direction: nextHours.windDirection,
          });
        }

        this.pressures.push({
          x,
          y: Math.floor(nextHours.pressureSeaLevel),
        });

        pointStart = (x + to) / 2;
      });

      this.createChart();
    };

    new Meteogram(data, "hourlyWeatherChart");
  }
});
