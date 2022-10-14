import { weather } from './Weather';
import { nav } from './Nav';

export const APPLICATION_ID = '#js-application';
export const SPINNER_ID = '#js-spinner';

export const GOOGLE_API = process.env.GOOGLE_API_KEY;
// export const CORS_ANYWHERE = 'https://cors-anywhere.herokuapp.com/';
const GOOGLE_GEOLOCATION_LINK = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=';
const DEFAULT_LOCATION = 'Kraków, Poland';

class App {

    init() {
        this.getGeolocation();
    }

    getGeolocation() {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
        } else {
            navigator.geolocation.getCurrentPosition(this.succeedGeolocated, this.failedGeolocated);
        }
    }

    failedGeolocated() {
        alert('Unable to retrieve your location');
        const address = DEFAULT_LOCATION;
        nav.removeLocations();
        nav.myLocations = [];
        weather.getWeatherData(address);
        const locationsList = nav.getAllLocationsLocalStorage();
        for (const location in locationsList) {
            const name = locationsList[location];
            const shortName = name.slice(0, name.indexOf(','));
            nav.createNewLocation(shortName);
        }
        nav.myLocations[0].classList.add('nav__location--active');
    }

    async succeedGeolocated(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const link = `${GOOGLE_GEOLOCATION_LINK}${latitude},${longitude}&key=${GOOGLE_API}`
        const response = await fetch(link);
        if (!response.ok) {
            const message = `An error has occured: ${response.status}`;
            throw new Error(message);
        };
        const data = await response.json();
        const { compound_code } = await data.plus_code;
        const address = await compound_code.slice(9);
        nav.setLocationLocalStorage('Current Location', address);
        nav.removeLocations();
        nav.myLocations = [];
        weather.getWeatherData(address);
        const locationsList = nav.getAllLocationsLocalStorage();
        for (const location in locationsList) {
            const name = locationsList[location];
            const shortName = name.slice(0, name.indexOf(','));
            nav.createNewLocation(shortName);
        }
        nav.setCurrentLocation();
        return;
    }
}
export const app = new App();
app.init();