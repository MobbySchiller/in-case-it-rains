import { search } from './Search';
import { weather } from './Weather';

const APPLICATION_ID = '#js-application';
const HAMBURGER_BUTTON_ID = '#js-hamburger-button';
const NAVIGATION_ID = '#js-navigation';
const HEADER_ID = '#js-header';
const NAV_ADD_BUTTON_ID = '#js-nav-add-button';
const NAV_REMOVE_BUTTON_ID = '#js-nav-remove-button';
const NAV_SWITCH_BUTTON_ID = '#js-nav-switch-button';
const NAV_SWITCH_BUTTON_DOT_ID = '#js-nav-switch-button-dot';
const NAV_LOCATIONS_LIST_ID = '#js-nav-locations-list';


class Nav {
    constructor() {
        this.hamburgerButton = document.querySelector(HAMBURGER_BUTTON_ID);
        this.navigation = document.querySelector(NAVIGATION_ID);
        this.application = document.querySelector(APPLICATION_ID);
        this.header = document.querySelector(HEADER_ID);
        this.navAddButton = document.querySelector(NAV_ADD_BUTTON_ID);
        this.navRemoveButton = document.querySelector(NAV_REMOVE_BUTTON_ID);
        this.navSwitchButton = document.querySelector(NAV_SWITCH_BUTTON_ID);
        this.navLocationsList = document.querySelector(NAV_LOCATIONS_LIST_ID);
        this.myLocations = [...document.querySelectorAll('.nav__location')];
        this.celsiusUnit = true;
        this.removeActive = false;
    }

    init() {
        window.addEventListener('resize', () => this.windowSize())
        this.hamburgerButton.addEventListener('click', () => this.openAndExitNav());
        this.navAddButton.addEventListener('click', () => this.sendToInput());
        this.navRemoveButton.addEventListener('click', () => this.manageRemoveButtons())
        this.navSwitchButton.addEventListener('click', () => this.switchUnit());
        this.myLocations.forEach(location => location.addEventListener('click', (e) => this.pickLocation(e)));
    }

    windowSize() {
        return window.innerWidth;
    }

    openAndExitNav() {
        this.navigation.classList.toggle('nav--active');
        this.application.classList.toggle('app--opened-nav');
        this.header.classList.toggle('header--opened-nav');
    }

    sendToInput() {
        console.log('send')
        if (this.windowSize() > 1200) {
            search.searchInput.focus();
            search.searchResults.classList.add('search__results--active');
        } else {
            this.exitNav();
            setTimeout(() => search.openSearchBar(), 200);
        }
    }

    manageRemoveButtons() {
        if (!this.removeActive) {
            this.displayRemoveButtons();
        } else {
            this.hideRemoveButtons();
        }
        this.removeActive = !this.removeActive;
    }

    displayRemoveButtons() {
        this.myLocations.forEach(location => location.childNodes[2].classList.add('remove-button--active'));
    }

    hideRemoveButtons() {
        this.myLocations.forEach(location => location.childNodes[2].classList.remove('remove-button--active'));
    }

    switchUnit() {
        const dot = document.querySelector(NAV_SWITCH_BUTTON_DOT_ID);
        dot.classList.toggle('nav__switch-unit-dot--active');
        this.celsiusUnit = !this.celsiusUnit;
        if (this.celsiusUnit) {
            weather.unit = 'metric';
            weather.windUnit.textContent = 'km/h';
        } else {
            weather.unit = 'us';
            weather.windUnit.textContent = 'mph';
        }
        weather.getWeatherData(weather.location);
    }

    exitNav() {
        this.navigation.classList.remove('nav--active');
        this.application.classList.remove('app--opened-nav');
        this.header.classList.remove('header--opened-nav');
    }

    addNewLocation(name) {
        if (this.myLocations.length <= 8) {
            if (this.getLocationLocalStorage(name)) return;
            const shortName = name.slice(0, name.indexOf(','));
            this.setLocationLocalStorage(shortName, name);
            this.createNewLocation(shortName);
            setTimeout(() => search.closeAfterLocationPicked(), 200);
        } else {
            alert('There is no space for another location')
        }
    }

    createNewLocation(shortName) {
        const listElement = document.createElement('li');
        const spanIcon = document.createElement('span');
        const spanName = document.createElement('span');
        const remove = document.createElement('span');

        listElement.classList.add('nav__location');
        listElement.id = this.locationID++;
        spanIcon.className = 'nav__location-pin fa-solid fa-location-dot';
        spanIcon.addEventListener('click', (e) => this.pickLocation(e));
        spanName.classList.add('nav__location-name');
        spanName.textContent = shortName;
        spanName.addEventListener('click', (e) => this.pickLocation(e));
        remove.textContent = '-';
        remove.classList.add('remove-button');
        remove.addEventListener('click', (e) => this.removeChosenLocation(e));

        listElement.appendChild(spanIcon);
        listElement.appendChild(spanName);
        listElement.appendChild(remove);
        this.navLocationsList.appendChild(listElement);
        this.myLocations.push(listElement);
    }

    removeChosenLocation(e) {
        const location = e.target.parentNode;
        const index = this.myLocations.indexOf(location);
        const locationName = location.childNodes[1].textContent;
        location.remove();
        this.myLocations.splice(index, 1);
        this.removeLocationFromLocalStorage(locationName);
        this.hideRemoveButtons();
    }

    removeLocations() {
        const list = this.navLocationsList;
        while (list.firstChild) {
            list.removeChild(list.lastChild)
        }
    }

    setCurrentLocation() {
        const currentLocation = this.navLocationsList.children[0];
        const secondChild = currentLocation.childNodes[1];
        secondChild.textContent = 'Current Location';
        currentLocation.classList.add('nav__location--active');
    }

    pickLocation(e) {
        const pickedLocation = e.target.textContent;
        weather.getWeatherData(this.getLocationLocalStorage(pickedLocation));
        this.myLocations.forEach(location => location.classList.remove('nav__location--active'));
        e.target.parentNode.classList.add('nav__location--active');
        this.exitNav();

    }

    setLocationLocalStorage(shortLocationName, locationName) {
        if (localStorage.getItem('addedLocations')) {
            const storedLocations = JSON.parse(localStorage.getItem('addedLocations'))
            storedLocations[shortLocationName] = locationName;
            localStorage.setItem('addedLocations', JSON.stringify(storedLocations));
        } else if (!localStorage.getItem('addedLocations')) {
            const firstLocation = new Object();
            firstLocation[shortLocationName] = locationName;
            localStorage.setItem('addedLocations', JSON.stringify(firstLocation));
        }
    }

    getLocationLocalStorage(shortLocationName) {
        const storedJSON = localStorage.getItem('addedLocations');
        const storedLocations = JSON.parse(storedJSON);
        return storedLocations[shortLocationName];
    }

    getAllLocationsLocalStorage() {
        const storedJSON = localStorage.getItem('addedLocations');
        const storedLocations = JSON.parse(storedJSON);
        return storedLocations;
    }

    removeLocationFromLocalStorage(location) {
        const storedLocations = JSON.parse(localStorage.getItem('addedLocations'));
        delete storedLocations[location];
        localStorage.setItem('addedLocations', JSON.stringify(storedLocations));
    }
}

export const nav = new Nav();
nav.init();