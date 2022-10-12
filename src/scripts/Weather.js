import { gradient, weekday } from './base';

const WEATHER_LOCATION_ID = '#js-weather-location';
const BACKGROUND_ID = '#js-background';
const ICON_ID = '#js-weather-icon';
const TEMP_ID = '#js-weather-temp';
const TEMP_MAX_ID = '#js-weather-temp-max';
const TEMP_MIN_ID = '#js-weather-temp-min';
const DESCRIPTION_ID = '#js-weather-description';
const HOURLY_FORECAST_HOUR_DATA = '[data-hourly-hour]';
const HOURLY_FORECAST_ICON_DATA = '[data-hourly-icon]';
const HOURLY_FORECAST_TEMP_DATA = '[data-hourly-temp]';
const DAILY_FORECAST_DAY_DATA = '[data-daily-day]';
const DAILY_FORECAST_ICON_DATA = '[data-daily-icon]';
const DAILY_FORECAST_TEMP_DATA = '[data-daily-temp]';
const FEELS_LIKE_ID = '#js-weather-feels-like';
const HUMIDITY_ID = '#js-weather-humidity';
const WIND_SPEED_ID = '#js-weather-wind-speed';
const WIND_SPEED_UNIT_ID = '#js-weather-wind-speed-unit';
const PRESSURE_ID = '#js-weather-pressure';
const SPINNER_ID = '#js-spinner';

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_LINK = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/';

class Weather {
    constructor() {
        this.date = new Date();
        this.main = {
            weatherLocation: document.querySelector(WEATHER_LOCATION_ID),
            background: document.querySelector(BACKGROUND_ID),
            icon: document.querySelector(ICON_ID),
            temp: document.querySelector(TEMP_ID),
            tempMax: document.querySelector(TEMP_MAX_ID),
            tempMin: document.querySelector(TEMP_MIN_ID),
            description: document.querySelector(DESCRIPTION_ID)
        };
        this.hourlyForecast = {
            hours: [...document.querySelectorAll(HOURLY_FORECAST_HOUR_DATA)],
            icons: [...document.querySelectorAll(HOURLY_FORECAST_ICON_DATA)],
            temps: [...document.querySelectorAll(HOURLY_FORECAST_TEMP_DATA)]
        }
        this.dailyForecast = {
            days: [...document.querySelectorAll(DAILY_FORECAST_DAY_DATA)],
            icons: [...document.querySelectorAll(DAILY_FORECAST_ICON_DATA)],
            temps: [...document.querySelectorAll(DAILY_FORECAST_TEMP_DATA)]
        };
        this.details = {
            feelslike: document.querySelector(FEELS_LIKE_ID),
            humidity: document.querySelector(HUMIDITY_ID),
            windspeed: document.querySelector(WIND_SPEED_ID),
            pressure: document.querySelector(PRESSURE_ID),
        };
        this.windUnit = document.querySelector(WIND_SPEED_UNIT_ID);
        this.location = '';
        this.unit = 'metric';
        this.spinner = document.querySelector(SPINNER_ID);
    }

    async getWeatherData(place) {
        await this.displaySpinner();
        await this.getAndDisplayData(place);
        await this.hideSpinner();
    }

    async getAndDisplayData(place) {
        this.location = place;
        const link = `${WEATHER_LINK}${place}?IconSet=icons2&unitGroup=${this.unit}&elements=datetime%2CdatetimeEpoch%2Ctempmax%2Ctempmin%2Ctemp%2Cfeelslike%2Chumidity%2Cwindspeed%2Cpressure%2Cdescription%2Cicon&include=days%2Chours%2Ccurrent&contentType=json&key=${WEATHER_API_KEY}`;
        const response = await fetch(link);
        if (!response.ok) {
            const message = `An error has occured: ${response.status}`;
            throw new Error(message);
        };
        const data = await response.json();
        this.displayBasicInfo(data);
        this.displayHourlyForecast(data);
        this.displayDailyForecast(data);
        this.displayDetails(data);
    }

    displayBasicInfo(data) {
        const location = data.address;
        const locationShort = location.slice(0, location.indexOf(','));
        const { icon, temp } = data.currentConditions;
        const { description, tempmax, tempmin } = data.days[0];
        location.includes(',') ? this.main.weatherLocation.textContent = locationShort : this.main.weatherLocation.textContent = location;
        this.main.temp.textContent = Math.round(temp);
        this.main.icon.style.backgroundImage = `url('./assets/${icon}-animated.svg')`;

        const backgroundName = this.removeSignFromString(icon, '-');
        this.main.background.style.background = `linear-gradient(${gradient[backgroundName]})`;

        this.main.tempMax.textContent = Math.round(tempmax);
        this.main.tempMin.textContent = Math.round(tempmin);
        this.main.description.textContent = description;
    }

    displayHourlyForecast(data) {
        const currentDay = 0;
        const nextDay = 1;
        const { datetime } = data.currentConditions;
        const time = Number(datetime.slice(0, 2));
        const hours = [];
        const icons = [];
        const temps = [];

        for (let i = time; i < 24; i++) {
            const { icon, temp } = data.days[currentDay].hours[i];
            hours.push(i);
            icons.push(icon);
            temps.push(Math.round(temp));
        }
        if (time !== 0) {
            for (let j = 0; j < time; j++) {
                const { icon, temp } = data.days[nextDay].hours[j];
                hours.push(j);
                icons.push(icon);
                temps.push(Math.round(temp));
            }
        }

        for (let k = 0; k < this.hourlyForecast.hours.length; k++) {
            this.hourlyForecast.hours[k].textContent = `${hours[k]}:00`;
            this.hourlyForecast.icons[k].style.backgroundImage = `url('./assets/${icons[k]}.svg')`;
            this.hourlyForecast.temps[k].textContent = `${temps[k]}`;
        }
    }

    displayDailyForecast(data) {
        const days = [];
        const icons = [];
        const temps = [];
        for (let i = 1; i < 8; i++) {
            const { datetime, icon, temp } = data.days[i];
            const numberOfDay = new Date(datetime).getDay();
            const day = weekday[numberOfDay];
            days.push(day);
            icons.push(icon);
            temps.push(Math.round(temp));
        }

        for (let j = 0; j < this.dailyForecast.days.length; j++) {
            this.dailyForecast.days[j].textContent = days[j];
            this.dailyForecast.icons[j].style.backgroundImage = `url('./assets/${icons[j]}.svg')`;
            this.dailyForecast.temps[j].textContent = `${temps[j]}`;
        }
    }

    displayDetails(data) {
        const { feelslike, humidity, pressure, windspeed } = data.currentConditions;
        this.details.feelslike.textContent = feelslike;
        this.details.humidity.textContent = humidity;
        this.details.pressure.textContent = pressure;
        this.details.windspeed.textContent = windspeed;
    }

    displaySpinner() {
        this.spinner.classList.add('spinner--visible');
    }

    hideSpinner() {
        this.spinner.classList.remove('spinner--visible');
    }

    removeSignFromString(string, sign) {
        let word = string;
        while (word.includes(sign)) {
            word = word.replace(sign, '');
        }
        return word;
    }
}
export const weather = new Weather();