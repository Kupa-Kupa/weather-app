import { useState, useEffect, useRef } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { convertToCoordinates } from '../utils/utils';

function Weather() {
  interface Location {
    name: string;
    lat: number;
    lon: number;
    country: string;
    state: string;
  }

  interface Coordinates {
    lat: number;
    lng: number;
  }

  interface Marker {
    lat: number;
    lon: number;
    size: number;
    color: string;
  }

  const markerSvg = `<svg viewBox="-4 0 36 36">
    <path fill="currentColor" d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"></path>
    <circle fill="black" cx="14" cy="14" r="7"></circle>
  </svg>`;

  const [markerData, setMarkerData] = useState([
    { lat: -33.8698439, lng: 151.2082848, size: 16, color: 'red' },
  ]);

  const [searchLocation, setSearchLocation] = useState<string | undefined>(
    'sydney'
  );
  const [currentUnitSystem, setCurrentUnitSystem] = useState('metric');
  const [currentTempUnit, setCurrentTempUnit] = useState('°C');

  const [mapLat, setMapLat] = useState<number | undefined>(undefined);
  const [mapLon, setMapLon] = useState<number | undefined>(undefined);

  const key = import.meta.env.VITE_WEATHER_API_KEY;

  function getLocation() {
    const locationInput = document.querySelector(
      '#city-search'
    ) as HTMLInputElement;

    setSearchLocation(locationInput.value);
  }

  function changeUnits() {
    if (currentUnitSystem === 'metric') {
      setCurrentUnitSystem('imperial');
      setCurrentTempUnit('°F');
    } else {
      setCurrentUnitSystem('metric');
      setCurrentTempUnit('°C');
    }
  }

  useEffect(() => {
    let lat: string;
    let lon: string;
    let locationList: Array<Location>;

    // clear any previous error messages
    const errorMessage = document.querySelector(
      '.error-message'
    ) as HTMLElement;
    errorMessage.innerText = ``;

    getWeather();

    async function getWeather() {
      const geoRequestInfo = await getGeoData();

      if (geoRequestInfo.ok) {
        if (geoRequestInfo.geoDataLength > 0) {
          const temp = await getWeatherData();

          render(temp);
        } else {
          errorMessage.innerText = `The city you're searching for couldn't be found. Try again.`;
        }
      } else {
        errorMessage.innerText = `The city you're searching for couldn't be found. Try again.`;
      }
    }

    async function getGeoData() {
      // if search location is blank then just return as though request was bad
      if (searchLocation == '' || !searchLocation)
        return { ok: false, geoDataLength: 0 };

      // get lat and lon of location
      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${searchLocation}&limit=5&appid=${key}`,
        {
          mode: 'cors',
        }
      );

      const geoData = await geoResponse.json();

      // set lat and lon only if the request is ok
      if (geoResponse.ok) {
        if (geoData.length > 0) {
          lat = `${parseFloat(geoData[0].lat)}`;
          lon = `${parseFloat(geoData[0].lon)}`;

          const clickData = {
            lat: parseFloat(geoData[0].lat),
            lng: parseFloat(geoData[0].lon),
            size: 16,
            color: 'red',
          };
          setMarkerData([clickData]);
        }

        locationList = geoData;
      }

      // return the fetch response so that I can handle any bad requests
      return { ok: geoResponse.ok, geoDataLength: geoData.length };
    }

    async function getWeatherData() {
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${currentUnitSystem}&appid=${key}`,
        {
          mode: 'cors',
        }
      );

      const weatherData = await weatherResponse.json();
      return weatherData.main.temp;
    }

    async function render(temp: number) {
      const city = document.querySelector('.city') as HTMLElement;
      const state = document.querySelector('.state') as HTMLElement;
      const country = document.querySelector('.country') as HTMLElement;
      const temperature = document.querySelector('.temperature') as HTMLElement;

      city.innerText = `${locationList[0].name}, `;
      state.innerText = `${locationList[0].state}, `;
      country.innerText = `${locationList[0].country}`;
      temperature.innerText = `${temp} ${currentTempUnit}`;
    }
  }, [searchLocation]);

  // Globe code
  const globeEl = useRef(undefined);

  function getMapCoordinates(e: Coordinates) {
    setMapLat(e.lat);
    setMapLon(e.lng);

    const clickData = { lat: e.lat, lng: e.lng, size: 16, color: 'red' };
    setMarkerData([clickData]);
  }

  // Position globe to current search location
  useEffect(() => {
    if (globeEl.current) {
      (globeEl.current as GlobeMethods).pointOfView({
        lat: markerData[0].lat,
        lng: markerData[0].lng,
        altitude: 3,
      });
    }
  }, [markerData]);

  useEffect(() => {
    // clear any previous error messages
    const errorMessage = document.querySelector(
      '.error-message'
    ) as HTMLElement;
    errorMessage.innerText = ``;

    getWeatherForMap();

    async function getWeatherForMap() {
      const temp = await getWeatherDataForMap();

      if (temp) {
        renderForMap(temp);
      }
    }

    async function getWeatherDataForMap() {
      if (mapLat && mapLon) {
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${mapLat}&lon=${mapLon}&units=${currentUnitSystem}&appid=${key}`,
          {
            mode: 'cors',
          }
        );

        const weatherData = await weatherResponse.json();

        return weatherData.main.temp;
      }
    }

    async function renderForMap(temp: number) {
      const city = document.querySelector('.city') as HTMLElement;
      const state = document.querySelector('.state') as HTMLElement;
      const country = document.querySelector('.country') as HTMLElement;
      const temperature = document.querySelector('.temperature') as HTMLElement;

      city.innerText = `${convertToCoordinates(mapLat as number, 'lat')}, `;
      state.innerText = `${convertToCoordinates(mapLon as number, 'lon')}`;
      country.innerText = '';
      temperature.innerText = `${temp} ${currentTempUnit}`;
    }
  }, [mapLat, mapLon]);

  // I want to update the temperature for the last location, previously it was
  // updating for the last search only as both useEffects were being triggered
  useEffect(() => {
    let lat: string;
    let lon: string;
    let locationList: Array<Location>;

    // clear any previous error messages
    const errorMessage = document.querySelector(
      '.error-message'
    ) as HTMLElement;
    errorMessage.innerText = ``;

    const city = document.querySelector('.city') as HTMLElement;
    const cityFirstChar = city.innerText[0];

    if (isNaN(parseInt(cityFirstChar))) {
      getWeather();
    } else {
      getWeatherForMap();
    }

    async function getWeatherForMap() {
      const temp = await getWeatherDataForMap();

      if (temp) {
        renderForMap(temp);
      }
    }

    async function getWeatherDataForMap() {
      if (mapLat && mapLon) {
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${mapLat}&lon=${mapLon}&units=${currentUnitSystem}&appid=${key}`,
          {
            mode: 'cors',
          }
        );

        const weatherData = await weatherResponse.json();

        return weatherData.main.temp;
      }
    }

    async function renderForMap(temp: number) {
      const city = document.querySelector('.city') as HTMLElement;
      const state = document.querySelector('.state') as HTMLElement;
      const country = document.querySelector('.country') as HTMLElement;
      const temperature = document.querySelector('.temperature') as HTMLElement;

      city.innerText = `${convertToCoordinates(mapLat as number, 'lat')}, `;
      state.innerText = `${convertToCoordinates(mapLon as number, 'lon')}`;
      country.innerText = '';
      temperature.innerText = `${temp} ${currentTempUnit}`;
    }

    async function getWeather() {
      const geoRequestInfo = await getGeoData();

      if (geoRequestInfo.ok) {
        if (geoRequestInfo.geoDataLength > 0) {
          const temp = await getWeatherData();

          render(temp);
        } else {
          errorMessage.innerText = `The city you're searching for couldn't be found. Try again.`;
        }
      } else {
        errorMessage.innerText = `The city you're searching for couldn't be found. Try again.`;
      }
    }

    async function getGeoData() {
      // if search location is blank then just return as though request was bad
      if (searchLocation == '' || !searchLocation)
        return { ok: false, geoDataLength: 0 };

      // get lat and lon of location
      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${searchLocation}&limit=5&appid=${key}`,
        {
          mode: 'cors',
        }
      );

      const geoData = await geoResponse.json();

      // set lat and lon only if the request is ok
      if (geoResponse.ok) {
        if (geoData.length > 0) {
          lat = `${parseFloat(geoData[0].lat)}`;
          lon = `${parseFloat(geoData[0].lon)}`;
        }

        locationList = geoData;
      }

      // return the fetch response so that I can handle any bad requests
      return { ok: geoResponse.ok, geoDataLength: geoData.length };
    }

    async function getWeatherData() {
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${currentUnitSystem}&appid=${key}`,
        {
          mode: 'cors',
        }
      );

      const weatherData = await weatherResponse.json();

      return weatherData.main.temp;
    }

    async function render(temp: number) {
      const city = document.querySelector('.city') as HTMLElement;
      const state = document.querySelector('.state') as HTMLElement;
      const country = document.querySelector('.country') as HTMLElement;
      const temperature = document.querySelector('.temperature') as HTMLElement;

      city.innerText = `${locationList[0].name}, `;
      state.innerText = `${locationList[0].state}, `;
      country.innerText = `${locationList[0].country}`;
      temperature.innerText = `${temp} ${currentTempUnit}`;
    }
  }, [currentTempUnit, currentUnitSystem]);

  return (
    <div className="weather-wrapper flex flex-col gap-8">
      <div className="px-6 flex justify-center gap-4 max-lg:flex-col max-lg:items-center">
        <label htmlFor="city-search" className="sr-only">
          Search
        </label>
        <input
          type="text"
          name="city-search"
          id="city-search"
          className="max-w-lg p-3 pl-6 block w-80 border-gray-200 rounded-md text-sm"
          placeholder="Search for City"
        ></input>

        <button
          type="button"
          id="search-btn"
          className="max-w-lg bg-white hover:bg-slate-100  text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
          onClick={getLocation}
        >
          What's the Weather Like?
        </button>

        <button
          type="button"
          id="temperature-units"
          className="max-w-lg bg-white hover:bg-slate-100  text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
          onClick={changeUnits}
        >
          °C / °F
        </button>
      </div>

      <div className="error-wrapper max-w-2xl p-6 m-auto rounded text-center">
        <div className="error-message text-red-600"></div>
      </div>

      <div className="weather-data">
        <div className="data-wrapper flex flex-col items-center gap-4 bg-white max-w-2xl m-auto rounded p-4 max-lg:max-w-xs max-lg:px-8">
          <div>
            <span className="city">Sydney, </span>
            <span className="state">New South Wales, </span>
            <span className="country">AU</span>
          </div>
          <div className="temperature">00.00 °C</div>
        </div>
      </div>

      <small className="display-info">
        Temperature is currently displaying in {currentTempUnit}
      </small>

      <div className="globe-container">
        <Globe
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="/weather-app/img/earth-blue-marble.jpg"
          showGraticules={true}
          showAtmosphere={false}
          onGlobeClick={getMapCoordinates}
          ref={globeEl}
          htmlElementsData={markerData}
          htmlElement={(data: Marker) => {
            const el = document.createElement('div');
            el.innerHTML = markerSvg;
            el.style.color = data.color;
            el.style.width = `${data.size}px`;
            el.classList.add('map-marker');

            return el;
          }}
        />
      </div>
    </div>
  );
}

export default Weather;

/*
    get location lat and lon with

    docs: https://openweathermap.org/api/geocoding-api

    http://api.openweathermap.org/geo/1.0/direct?
    q={city name},{state code},{country code}&limit={limit}&appid={API key}


    get weather data

    docs: https://openweathermap.org/current

    API Call:
    https://api.openweathermap.org/data/2.5/weather?
    lat={lat}&lon={lon}&appid={API key}

    units can be 'standard' (default), 'metric' (C), 'imperial' (F)
*/
