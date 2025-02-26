import json

from flask import (Flask, render_template, request, jsonify)
import requests

app = Flask(__name__)

WEATHER_API_KEY = 'vO5nAe4x0yOoiH1nW5bZgNxbP1p30B9V'
GEOCODING_API_KEY = 'AIzaSyB61St_Fi80ickyVz4vXFH9XO5CrFY199w'

weather_code_mapping = {
    1000: "Clear",
    1100: "Mostly Clear",
    1101: "Partly Cloudy",
    1102: "Mostly Cloudy",
    1001: "Cloudy",
    2000: "Fog",
    2100: "Light Fog",
    4000: "Drizzle",
    4001: "Rain",
    4200: "Light Rain",
    4201: "Heavy Rain",
    5000: "Snow",
    5001: "Flurries",
    5100: "Light Snow",
    5101: "Heavy Snow",
    6000: "Freezing Drizzle",
    6001: "Freezing Rain",
    6200: "Light Freezing Rain",
    6201: "Heavy Freezing Rain",
    7000: "Ice Pellets",
    7101: "Heavy Ice Pellets",
    7102: "Light Ice Pellets",
    8000: "Thunderstorm"
}

weather_icon_mapping = {
    1000: "clear_day.svg",
    1100: "mostly_clear_day.svg",
    1101: "partly_cloudy_day.svg",
    1102: "mostly_cloudy.svg",
    1001: "cloudy.svg",
    2000: "fog.svg",
    2100: "fog_light.svg",
    4000: "drizzle.svg",
    4001: "rain.svg",
    4200: "rain_light.svg",
    4201: "rain_heavy.svg",
    5000: "snow.svg",
    5001: "flurries.svg",
    5100: "snow_light.svg",        
    5101: "snow_heavy.svg",        
    6000: "freezing_drizzle.svg",  
    6001: "freezing_rain.svg",     
    6200: "freezing_rain_light.svg",
    6201: "freezing_rain_heavy.svg",
    7000: "ice_pellets.svg",       
    7101: "ice_pellets_heavy.svg",        
    7102: "ice_pellets_light.svg",        
    8000: "tstorm.svg"                    
}

precipitation_mapping = {
    0: "N/A",
    1: "Rain",
    2: "Snow",
    3: "Freezing Rain",
    4: "Ice Pellets"
}

def getWeather(url):
	headers = {
		"accept": "application/json",
        "Accept-Encoding": "gzip"
	}
	weather_response = requests.get(url, headers=headers)
	return weather_response.json()

@app.route('/')
def index():	
    return render_template('index.html')

@app.route('/weather', methods=['GET'])
def weather():
    lat = request.args.get('lat')
    lng = request.args.get('lng')

    street = request.args.get('street')
    city = request.args.get('city')
    state = request.args.get('state')

    address = f"{street}, {city}, {state}"
    geocoding_url = ""

    if lat and lng:
        geocoding_url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lng}&key={GEOCODING_API_KEY}"
    else:
        address = f"{street},{city},{state}"
        geocoding_url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={GEOCODING_API_KEY}"
    
    geocoding_response = requests.get(geocoding_url)
    geocoding_data = geocoding_response.json()

    lat = geocoding_data['results'][0]['geometry']['location']['lat']
    lng = geocoding_data['results'][0]['geometry']['location']['lng']

    fields_list = "cloudCover,humidity,precipitationProbability,precipitationType,pressureSeaLevel,sunriseTime,sunsetTime,temperature,temperatureMax,temperatureMin,uvIndex,visibility,weatherCode,windSpeed"
    weather_url = f"https://api.tomorrow.io/v4/timelines?location={lat},{lng}&fields={fields_list}&timesteps=1d&units=imperial&timezone=America/Los_Angeles&apikey={WEATHER_API_KEY}"
    weather_data = getWeather(weather_url)

    for i in range(len(weather_data['data']['timelines'][0]['intervals'])):
        interval = weather_data['data']['timelines'][0]['intervals'][i]
        wc = interval['values']['weatherCode']
        interval['values']['description'] = weather_code_mapping[wc]
        weather_icon = weather_icon_mapping[wc]
        interval['values']['icon'] = f"/static/images/symbols/{weather_icon}"
        interval['values']['precipitationType'] = precipitation_mapping[interval['values']['precipitationType']]

    fields_list = "temperature,humidity,pressureSeaLevel,windSpeed,windDirection"
    weather_url_h = f"https://api.tomorrow.io/v4/timelines?location={lat},{lng}&fields={fields_list}&timesteps=1h&units=imperial&timezone=America/Los_Angeles&apikey={WEATHER_API_KEY}"
    weather_data_h = getWeather(weather_url_h)

    res = {
         "loc" : geocoding_data['results'][0]['formatted_address'],
         "d" : weather_data['data'],
         "h" : weather_data_h['data']
    }

    return jsonify(res)

if __name__ == '__main__':
	app.run(debug=True)