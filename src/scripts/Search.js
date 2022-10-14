import { nav } from './Nav';
import { weather } from './Weather';
import { GOOGLE_API, CORS_ANYWHERE } from './App';

const SEARCH_BUTTON_ID = '#js-search-button';
const SEARCH_BAR_ID = '#js-search-bar';
const SEARCH_INPUT_ID = '#js-search-input';
const SEARCH_XMARK_ID = '#js-search-xmark';
const SEARCH_RESULTS_ID = '#js-search-results';
const GOOGLE_AUTOCOMPLETE_LINK = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?language=en&types=(cities)';

class Search {
    constructor() {
        this.searchButton = document.querySelector(SEARCH_BUTTON_ID);
        this.searchBar = document.querySelector(SEARCH_BAR_ID);
        this.searchInput = document.querySelector(SEARCH_INPUT_ID);
        this.searchXMark = document.querySelector(SEARCH_XMARK_ID);
        this.searchResults = document.querySelector(SEARCH_RESULTS_ID);
        this.places = [];
    }

    init() {
        this.searchButton.addEventListener('click', () => this.openSearchBar());
        this.searchXMark.addEventListener('click', () => this.clearInput());
        this.searchInput.addEventListener('input', (e) => this.manageSearchResults(e));
    }

    openSearchBar() {
        this.searchBar.classList.add('search__bar--active');
        this.searchInput.focus();
    }

    clearInput() {
        if (!this.searchInput.value) {
            this.closeSearchBar();
        }
        this.searchInput.value = '';
        this.closeSearchResults();
    }

    closeSearchBar() {
        this.searchBar.classList.remove('search__bar--active');
    }

    closeSearchResults() {
        this.searchResults.classList.remove('search__results--active');
    }

    manageSearchResults(e) {
        this.openSearchResults(e);
        this.getPlaces(e);
    }

    openSearchResults(e) {
        e.target.value !== '' ? this.searchResults.classList.add('search__results--active') : this.searchResults.classList.remove('search__results--active');
    }

    async getPlaces(e) {
        const text = await e.target.value;
        await this.getAutocomplete(text);
        await this.displayAutocomplete(this.places);
    }

    async getAutocomplete(place) {
        const link = `${CORS_ANYWHERE}${GOOGLE_AUTOCOMPLETE_LINK}&input=${place}&key=${GOOGLE_API}`;
        const response = await fetch(link);
        if (!response.ok) {
            const message = `An error has occured: ${response.status}`;
            throw new Error(message);
        };
        const data = await response.json();
        const responseArray = await data.predictions;
        const results = await responseArray.map(result => result.description);
        this.places = results;
    }

    displayAutocomplete(places) {
        while (this.searchResults.firstChild) {
            this.searchResults.removeChild(this.searchResults.firstChild);
        };
        places.forEach(place => this.createAutocompleteListElement(place))
    }

    createAutocompleteListElement(place) {
        const listElement = document.createElement('li');
        listElement.classList.add('result');
        const paragraph = document.createElement('p');
        paragraph.classList.add('result__name');
        paragraph.textContent = place;
        paragraph.addEventListener('click', () => this.pickWeatherFromSearchResult(place));
        const button = document.createElement('button');
        button.classList.add('result__add-button');
        button.textContent = 'add';
        button.addEventListener('click', () => nav.addNewLocation(place));
        listElement.appendChild(paragraph);
        listElement.appendChild(button);
        this.searchResults.appendChild(listElement);
    }

    pickWeatherFromSearchResult(place) {
        weather.getWeatherData(place);
        setTimeout(() => this.closeAfterLocationPicked(), 200)
    }

    closeAfterLocationPicked() {
        this.searchInput.value = '';
        this.closeSearchResults();
        this.closeSearchBar();
    }
}

export const search = new Search();
search.init();