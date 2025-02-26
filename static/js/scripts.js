document.addEventListener('DOMContentLoaded', function() {
    const autoDetectCheckbox = document.getElementById('auto_detect');
    const street = document.getElementById('street');
    const city = document.getElementById('city');
    const state = document.getElementById('state');
    const resetBtn = document.getElementById('resetBtn');

    if (autoDetectCheckbox.checked) {
        removeRequiredAttributes();
    } else {
        addRequiredAttributes();
    }

    autoDetectCheckbox.addEventListener('change', function() {
        if (this.checked) {
            removeRequiredAttributes();
        } else {
            addRequiredAttributes();
        }
    });

    resetBtn.addEventListener('click', function() {
        addRequiredAttributes();
    });

    function removeRequiredAttributes() {
        street.removeAttribute('required');
        city.removeAttribute('required');
        state.removeAttribute('required');
    }

    function addRequiredAttributes() {
        street.setAttribute('required', 'required');
        city.setAttribute('required', 'required');
        state.setAttribute('required', 'required');
    }
});

document.getElementById('resetBtn').addEventListener('click', function(event) {
    const form = document.getElementById('weatherRequestForm');
    if(form) {
        form.reset();
    }

    const weatherCardContainer = document.getElementById('weatherCardContainer');
    if(weatherCardContainer) {
        weatherCardContainer.innerHTML = '';
    }

    const weatherTableContainer = document.getElementById('weatherTableContainer');
    if(weatherTableContainer) {
        weatherTableContainer.innerHTML = '';
    }

    const detailedWeatherContainer = document.getElementById('detailedWeatherContainer');
    if(detailedWeatherContainer) {
        detailedWeatherContainer.innerHTML = '';
    }

    const chartsContainer = document.getElementById('chartsContainer');
    if(chartsContainer) {
        chartsContainer.style.display = 'none';
    }

    const noRecordContainer = document.getElementById('noRecordContainer');
    if(noRecordContainer) {
        noRecordContainer.style.display = 'none';
    }
});

let cachedData = null;
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('weatherRequestForm');
    const noRecordContainer = document.getElementById('noRecordContainer');
    const weatherCardContainer = document.getElementById('weatherCardContainer');
    const weatherTableContainer = document.getElementById('weatherTableContainer');

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const autoDetectChecked = document.getElementById('auto_detect').checked;
        if(autoDetectChecked) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const url = `/weather?lat=${lat}&lng=${lng}&auto_detect=true`;
                    fetchWeatherData(url);
                },
                function(error) {
                    alert("Cannot get location, please type manually");
                }
            );
        } else {
            const street = document.getElementById('street').value;
            const city = document.getElementById('city').value;
            const state = document.getElementById('state').value;
            const url = `/weather?street=${street}&city=${city}&state=${state}`;
            fetchWeatherData(url);
        }

        function fetchWeatherData(url) {
            clear();
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    cachedData = data;
                    updateWeatherCard(data);
                    updateWeatherTable(data);
                })
                .catch(error => {
                    displayNoRecordsFound();
                });
        }
    });

    function displayNoRecordsFound() {
        noRecordContainer.style.display = "flex";
    }

    function clear() {
        weatherCardContainer.innerHTML = '';
        weatherTableContainer.innerHTML = '';
        noRecordContainer.style.display = "none";

        const detailedWeatherContainer = document.getElementById('detailedWeatherContainer');
        if(detailedWeatherContainer) {
            detailedWeatherContainer.innerHTML = '';
        }

        const chartsContainer = document.getElementById('chartsContainer');
        if(chartsContainer) {
            chartsContainer.style.display = 'none';
        }
    }

    function updateWeatherCard(data) {
        const location = data.loc;
        const intervalData = data.d.timelines[0].intervals[0].values;
        const temperature = intervalData.temperature;
        const description = intervalData.description;
        const icon = intervalData.icon;

        const humidity = intervalData.humidity;
        const pressure = intervalData.pressureSeaLevel;
        const windSpeed = intervalData.windSpeed;
        const visibility = intervalData.visibility;
        const cloudCover = intervalData.cloudCover;
        const uvIndex = intervalData.uvIndex;

        weatherCardContainer.innerHTML = `
            <div class="weatherCard">
                <p>${location}</p>
                <div class="weatherMain">
                    <img src="${icon}" alt="Weather Icon">
                    <p>${temperature}°</p>
                </div>
                <p id="summary">${description}</p>
                <div class="weatherInfo">
                    <div class="infoItem">
                        <p>Humidity</p>
                        <img src="/static/images/humidity.png" alt="Humidity Icon">
                        <p>${humidity}%</p>
                    </div>
                    <div class="infoItem">
                        <p>Pressure</p>
                        <img src="/static/images/Pressure.png" alt="Pressure Icon">
                        <p>${pressure}inHg</p>
                    </div>
                    <div class="infoItem">
                        <p>Wind Speed</p>
                        <img src="/static/images/Wind_Speed.png" alt="Wind Speed Icon">
                        <p>${windSpeed}mph</p>
                    </div>
                    <div class="infoItem">
                        <p>Visibility</p>
                        <img src="/static/images/Visibility.png" alt="Visibility Icon">
                        <p>${visibility}mi</p>
                    </div>
                    <div class="infoItem">
                        <p>Cloud Cover</p>
                        <img src="/static/images/Cloud_Cover.png" alt="Cloud Cover Icon">
                        <p>${cloudCover}%</p>
                    </div>
                    <div class="infoItem">
                        <p>UV Level</p>
                        <img src="/static/images/UV_Level.png" alt="UV Level Icon">
                        <p>${uvIndex}</p>
                    </div>
                </div>
            </div>
        `;
    }

    function updateWeatherTable(data) {
        const intervals = data.d.timelines[0].intervals;
        let tableHTML = `
            <table class="weatherTable">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Temp High</th>
                        <th>Temp Low</th>
                        <th>Wind Speed</th>
                    </tr>
                </thead>
                <tbody>
        `;

        let currentIndex = 0;
        intervals.forEach(interval => {
            const date = new Date(interval.startTime).toLocaleDateString('en-GB', {
                weekday: 'long',
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }).replace(/(\w+)( \d{2} \w{3} \d{4})/, '$1, $2');
            const status = interval.values.description;
            const tempHigh = interval.values.temperatureMax;
            const tempLow = interval.values.temperatureMin;
            const windSpeed = interval.values.windSpeed;
            const icon = interval.values.icon;

            tableHTML += `
                <tr class="weatherDate" data-index="${currentIndex}">
                    <td>${date}</td>
                    <td><div class="statusContainer"><img src="${icon}" alt="${status}"><span> ${status} </span></div></td>
                    <td>${tempHigh}</td>
                    <td>${tempLow}</td>
                    <td>${windSpeed}</td>
                </tr>
            `;

            currentIndex++;
        });

        tableHTML += '</tbody></table>';
        weatherTableContainer.innerHTML = tableHTML;

        const weatherDates = document.querySelectorAll('.weatherDate');
        weatherDates.forEach(dateElement => {
            dateElement.addEventListener('click', function () {
                const selectedIndex = this.getAttribute('data-index');
                getDetailedWeather(selectedIndex);
            });
        });
    }

    function getDetailedWeather(index) {
        weatherCardContainer.innerHTML = '';
        weatherTableContainer.innerHTML = '';

        const selectedInterval = cachedData.d.timelines[0].intervals[index];
        const date = new Date(selectedInterval.startTime).toLocaleDateString('en-GB', {
            weekday: 'long',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).replace(/(\w+)( \d{2} \w{3} \d{4})/, '$1, $2');
        const v = selectedInterval.values;
        const status = v.description;
        const tempHigh = v.temperatureMax;
        const tempLow = v.temperatureMin;
        const icon = v.icon;
        const precipitation = v.precipitationType;
        const precipitationProbability = v.precipitationProbability;
        const windSpeed = v.windSpeed;
        const humidity = v.humidity;
        const visibility = v.visibility;
        const sunrise = new Date(v.sunriseTime).toLocaleTimeString('en-US', {
            hour: 'numeric',
            hour12: true
          }).replace(' ', '');
        const sunset = new Date(v.sunsetTime).toLocaleTimeString('en-US', {
            hour: 'numeric',
            hour12: true
          }).replace(' ', '');

        const detailedWeatherHTML = `
            <p class="p1"> Daily Weather Details </p>
            <div class = "detailedWeatherCard">
                <div class = "weatherHeader">
                    <div class = "leftSection">
                        <p id = "p1">${date}</p>
                        <p id = "p2">${status}</p>
                        <p id = "p3">${tempHigh}°F/${tempLow}°F</p>
                    </div>
                    <div class = "rightSection">
                        <img src = "${icon}" alt = "Weather Icon">
                    </div>
                </div>
                <div class = "weatherDetails">
                    <div class="detailsItem">
                        <span class="label">Precipitation: </span>
                        <span class="value">${precipitation}</span>
                    </div>
                    <div class="detailsItem">
                        <span class="label">Chance of Rain: </span>
                        <span class="value">${precipitationProbability}%</span>
                    </div>
                    <div class="detailsItem">
                        <span class="label">Wind Speed: </span>
                        <span class="value">${windSpeed} mph</span>
                    </div>
                    <div class="detailsItem">
                        <span class="label">Humidity: </span>
                        <span class="value">${humidity}%</span>
                    </div>
                    <div class="detailsItem">
                        <span class="label">Visibility: </span>
                        <span class="value">${visibility} mi</span>
                    </div>
                    <div class="detailsItem">
                        <span class="label">Sunrise/Sunset: </span>
                        <span class="value">${sunrise}/${sunset}</span>
                    </div>
                </div>
            </div>
            <p class="p1"> Weather Charts</p>
            <img id="img1" src="/static/images/point-down-512.png" alt="Point down">
        `;
        
        document.getElementById('detailedWeatherContainer').innerHTML = detailedWeatherHTML;
        enableToggleCharts();
    }

    function enableToggleCharts() {
        const toggleIcon = document.getElementById('img1');
        const chartsContainer = document.getElementById('chartsContainer');

        toggleIcon.style.cursor = 'pointer';
        let isExpanded = false;

        toggleIcon.addEventListener('click', function () {
            if (isExpanded) {
                chartsContainer.style.display = 'none';
                toggleIcon.src = '/static/images/point-down-512.png';
            } else {
                chartsContainer.style.display = 'flex';
                toggleIcon.src = '/static/images/point-up-512.png';
                renderChart1();
                renderChart2();

                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth'
                });
            }
            isExpanded = !isExpanded;
        });
    }

    function renderChart1() {
        const intervals = cachedData.d.timelines[0].intervals;

        const chartData = intervals.map(interval => {
            const date = new Date(interval.startTime).getTime();
            return [date, interval.values.temperatureMin, interval.values.temperatureMax];
        });

        Highcharts.chart('chart1', {
            chart: {
                type: 'arearange',
                zoomType: 'x'
            },
            title: {
                text: 'Temperature Ranges (Min, Max)'
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: { day: '%e %b' }
            },
            yAxis: {
                title: {
                    text: null
                },
                labels: {
                    y: 5
                }
            },
            tooltip: {
                shared: true,
                useHTML: true,
                formatter: function () {
                    const minTemp = this.points[0].point.low.toFixed(2);
                    const maxTemp = this.points[0].point.high.toFixed(2);
                    const date = Highcharts.dateFormat('%A, %b %e', this.x);

                    const dotStyle = `
                        display: inline-block;
                        width: 7px;
                        height: 7px;
                        border-radius: 50%;
                        background-color: rgb(44, 175, 254);
                        margin-right: 5px;
                    `;

                    return `<span style="font-size: 10px;">${date}</span><br><span style="${dotStyle}"></span>Temperatures: <b>${minTemp}°F - ${maxTemp}°F</b>`;
                }
            },
            plotOptions: {
                arearange: {
                    fillOpacity: 0.6,
                    marker: {
                        enabled: true,
                        radius: 4.5,
                        fillColor: 'rgb(44, 175, 254)',
                        lineWidth: 0,
                        zIndex: 10,
                        states: {
                            hover: {
                                enabled: true,
                                radius: 6,
                                lineWidth: 1,
                                lineColor: 'white',
                                fillColor: 'rgb(44, 175, 254)'
                            }
                        }
                    },
                    states: { 
                        hover: {
                            halo: {
                                size: 10,
                                attributes: {
                                    fill: 'rgb(44, 175, 254)'
                                }
                            }
                        }
                    },
                    point: {
                        events: {
                            mouseOver: function () {
                                const chart = this.series.chart;
                                const xAxis = chart.xAxis[0];
                                const plotLineId = 'hover-line';
        
                                xAxis.addPlotLine({
                                    value: this.x,
                                    color: 'rgb(200,200,200)',
                                    width: 1,
                                    id: plotLineId,
                                    dashStyle: 'Solid',
                                    zIndex: 1
                                });
                            },
                            mouseOut: function () {
                                const chart = this.series.chart;
                                const xAxis = chart.xAxis[0];
                                const plotLineId = 'hover-line';
        
                                xAxis.removePlotLine(plotLineId);
                            }
                        }
                    }
                }
            },
            series: [{
                name: 'Temperature',
                data: chartData,
                showInLegend: false,
                color: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, 'rgba(255, 140, 0, 0.9)'],
                        [1, 'rgba(30, 144, 255, 0.9)']
                    ]
                },
                lineColor: 'orange'
            }]
        });
    }
    
    function renderChart2() {
        const intervals = cachedData.h.timelines[0].intervals;

        const temperature = intervals.map(interval => [
            new Date(interval.startTime).getTime(), interval.values.temperature
        ]);

        const humidity = intervals.map(interval => [
            new Date(interval.startTime).getTime(), interval.values.humidity
        ]);
    
        const pressure = intervals.map(interval => [
            new Date(interval.startTime).getTime(), interval.values.pressureSeaLevel
        ]);
    
        const windSpeed = intervals.map(interval => [
            new Date(interval.startTime).getTime(), interval.values.windSpeed
        ]);

        const windSpeedDirection = intervals
        .filter((_, index) => index % 2 === 0)
        .map(interval => ({
            x: new Date(interval.startTime).getTime(),
            value: interval.values.windSpeed,
            direction: interval.values.windDirection
        }));

        const firstTimestamp = temperature[0][0];
        const lastTimestamp = temperature[temperature.length - 1][0];

        Highcharts.chart('chart2', {
            chart: {
                type: 'spline',
                zoomType: 'x',
                marginRight: 50
            },
            title: {
            text: 'Hourly Weather (For Next 5 Days)'
            },
            xAxis: [
                {
                    tickLength: 0,
                    type: 'datetime',
                    tickInterval: 6 * 3600 * 1000,
                    minorTickInterval: 3600 * 1000,
                    labels: {
                        format: '{value:%H}',
                        style: {
                            textOverflow: 'ellipsis'
                        }
                    },
                    gridLineWidth: 1,
                    minorGridLineWidth: 0.9,
                    min: firstTimestamp,
                    max: lastTimestamp,
                    plotLines: [
                        {
                            color: 'rgb(207, 207, 207)',
                            width: 1,
                            value: firstTimestamp,
                            zIndex: 5
                        },
                        {
                            color: 'rgb(207, 207, 207)',
                            width: 1,
                            value: lastTimestamp + 1 * 3600 * 1000,
                            zIndex: 5
                        }
                    ]
                },
                {
                    linkedTo: 0,
                    type: 'datetime',
                    tickInterval: 24 * 3600 * 1000,
                    labels: {
                        format: '{value:<b>%a</b> %b %e}',
                        align: 'left',
                        x: 2,
                        y: 0,
                        style: {
                            fontSize: '12px',
                        }
                    },
                    opposite: true,
                    tickLength: 15,
                    gridLineWidth: 1,
                }
            ],
            yAxis: [
                {
                    title: {
                        text: null
                    },
                    labels: {
                        format: '{value}°',
                        style: {
                            fontSize: '8px',
                        },
                        x: -2, 
                    },
                    min: 0,
                    max: 105,
                    tickInterval: 7,
                    gridLineWidth: 1,
                    height: '90%' ,
                },
                {
                    title: {
                        text: null
                    },    
                    labels: {
                        enabled: false
                    },
                    min: 0,
                    max: 130,
                    tickInterval: 10,
                    gridLineWidth: 0,
                    height: '90%',
                },
                {
                    title: {
                        text: 'inHg',
                        rotation: 0,
                        align:'high',
                        style: {
                            fontSize: '12px',
                            color : 'rgb(255,175,54)',
                        },
                        x : -20,
                    },
                    labels: {
                        formatter: function () {
                            if (this.value === 29) {
                                return this.value;
                            }
                            return '';
                        },
                        style: {
                            fontSize: '10px',
                            color : 'rgb(255,175,54)',
                        },
                        x: 4,
                    },
                    min: 0,
                    max: 58,
                    tickPositions: [0, 29, 58],
                    opposite: true,
                    gridLineWidth: 1,
                    tickLength: 2,
                    height: '90%',
                },
                {
                    title: {
                        text: null,
                    },
                    labels: {
                        enabled: false
                    },
                    min: 0,
                    max: 360,
                    tickInterval: 45,
                    gridLineWidth: 0,
                    top: '91%',
                    height: '10%',
                },
            ],
            tooltip: {
                shared: true,
                useHTML: true,
                formatter: function () {
                    const date = Highcharts.dateFormat('%A, %b %e, %H:%M', this.x);
                    const temp = this.points[0].y.toFixed(2);
                    const hum = (this.points[1] && this.points[1].y !== null) ? this.points[1].y.toFixed(0) : 'N/A';
                    const pressure = this.points[2] && this.points[2].y !== null ? this.points[2].y.toFixed(0) : 'N/A';
                    const wind = windSpeed.find(interval => interval[0] === this.x);
                    const windValue = wind ? wind[1].toFixed(2) : 'N/A';
                  
                    let windDescription = '';
                    if (windValue !== 'N/A') {
                        const windSpeedValue = parseFloat(windValue);
                        if (windSpeedValue < 1) {
                            windDescription = '(Calm)';
                        } else if (windSpeedValue <= 3) {
                            windDescription = '(Light air)';
                        } else if (windSpeedValue <= 7) {
                            windDescription = '(Light breeze)';
                        } else if (windSpeedValue <= 12) {
                            windDescription = '(Gentle breeze)';
                        } else if (windSpeedValue <= 18) {
                            windDescription = '(Moderate breeze)';
                        } else if (windSpeedValue <= 24) {
                            windDescription = '(Fresh breeze)';
                        } else if (windSpeedValue <= 31) {
                            windDescription = '(Strong breeze)';
                        } else if (windSpeedValue <= 38) {
                            windDescription = '(Near gale)';
                        } else if (windSpeedValue <= 46) {
                            windDescription = '(Gale)';
                        } else if (windSpeedValue <= 54) {
                            windDescription = '(Strong gale)';
                        } else if (windSpeedValue <= 63) {
                            windDescription = '(Storm)';
                        } else if (windSpeedValue <= 75) {
                            windDescription = '(Violent storm)';
                        } else {
                            windDescription = '(Hurricane)';
                        }
                    }
                
                return `<span style="font-size: 10px;">${date}</span><br>
                        <span style="color: red;">●</span> Temperature: <b>${temp}°F</b><br>
                        <span style="color: blue;">●</span> Humidity: <b>${hum} %</b><br>
                        <span style="color: rgb(255,175,54);">●</span> Air Pressure: <b>${pressure} inHg</b><br>
                        <span style="color: green;">●</span> Wind Speed: <b>${windValue} mph</b> ${windDescription}`;
            }
            },
            legend: {
                enabled: false
            },
            series: [
                {
                    name: 'Temperature',
                    data: temperature,
                    type: 'spline',
                    color: 'red',
                    lineWidth: 2,
                    zIndex: 10,
                    marker: {
                        enabled: false,
                        radius: 5,
                        fillColor: 'red',
                        lineWidth: 1,
                        lineColor: 'white',
                    },
                    states: {
                        hover: {
                            enabled: true,
                            lineWidth: 1,
                            marker: {
                                enabled: true,
                                radius: 1
                            }
                        }
                    }
                },
                {
                    name: 'Humidity',
                    data: humidity.map(interval => [
                        new Date(interval[0]).getTime(),
                        interval[1]
                    ]),
                    type: 'column',
                    color: 'rgb(123,198,254)',
                    yAxis: 1,
                    zIndex: 9,
                    pointRange: 3600 * 1000,
                    pointPlacement: 'between',
                    groupPadding: 0,
                    pointPadding: 0,
                    borderRadius: 3,
                    dataLabels: {
                        enabled: true,
                        formatter: function () {
                            return Math.round(this.y);
                        },
                        style: {
                            fontSize: '7px',
                            fontWeight: 'bold',
                            textOutline: '1px contrast',
                            color: 'rgb(127,127,127)',
                        },
                        align: 'center',
                        verticalAlign: 'bottom',
                        inside: false,
                        crop: false,
                        overflow: 'allow'
                    },
                    states: {
                        hover: {
                            enabled: true
                        }
                    }
                },
                {
                    name: 'Air Pressure',
                    data: pressure.map(interval => [
                        new Date(interval[0]).getTime(),
                        interval[1]
                    ]),
                    type: 'spline',
                    dashStyle: 'ShortDot',
                    color: 'rgb(255,175,54)',
                    yAxis: 2,
                    zIndex: 10,
                    marker: {
                        enabled: true,
                        radius: 1,
                        fillColor: 'rgb(255,175,54)',
                        lineWidth: 0,
                    },
                    states: {
                        hover: {
                            enabled: true,
                            marker: {
                                enabled: true,
                                radius: 10,
                                fillColor: 'rgb(255,175,54)',
                                lineWidth: 1,
                                symbol: 'diamond',
                                lineColor: 'white',
                            },
                        },
                    },
                },
                {
                    name: 'Wind',
                    type: 'windbarb',
                    data: windSpeedDirection,
                    yAxis: 3,
                    color: 'purple',
                    vectorLength: 8,
                    pointPlacement: 'on',
                },
            ]
        });
    }

});