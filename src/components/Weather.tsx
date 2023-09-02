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

  const [searchLocation, setSearchLocation] = useState<string | undefined>(
    'sydney'
  );
  const [currentUnitSystem, setCurrentUnitSystem] = useState('metric');
  const [currentTempUnit, setCurrentTempUnit] = useState('°C');

  const [mapLat, setMapLat] = useState<number | undefined>(undefined);
  const [mapLon, setMapLon] = useState<number | undefined>(undefined);

  const key = import.meta.env.VITE_WEATHER_API_KEY;

  function getLocation() {
    console.log('getting location');

    const locationInput = document.querySelector(
      '#city-search'
    ) as HTMLInputElement;

    console.log(`${locationInput.value}`);

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

    console.log('Current Search Location is:', searchLocation);
    getWeather();

    async function getWeather() {
      console.log('run GetWeather');

      const geoRequestInfo = await getGeoData();

      if (geoRequestInfo.ok) {
        if (geoRequestInfo.geoDataLength > 0) {
          const temp = await getWeatherData();

          console.log('Temperature', temp);

          render(temp);
        } else {
          console.log('handle empty getGeoData response');
          errorMessage.innerText = `The city you're searching for couldn't be found. Try again.`;
        }
      } else {
        console.log('handle bad getGeoData request');
        errorMessage.innerText = `The city you're searching for couldn't be found. Try again.`;
      }
    }

    async function getGeoData() {
      console.log('run getGeoData');
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

      console.log('geoResponse', geoResponse);

      // set lat and lon only if the request is ok
      if (geoResponse.ok) {
        console.log('geoData', geoData);

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
      console.log('run getWeatherData');
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${currentUnitSystem}&appid=${key}`,
        {
          mode: 'cors',
        }
      );

      console.log('weatherResponse', weatherResponse);

      const weatherData = await weatherResponse.json();

      console.log('log weather data:');
      console.log(weatherData);
      console.log(weatherData.main.temp);

      return weatherData.main.temp;
    }

    async function render(temp: number) {
      console.log('run render');
      const city = document.querySelector('.city') as HTMLElement;
      const state = document.querySelector('.state') as HTMLElement;
      const country = document.querySelector('.country') as HTMLElement;
      const temperature = document.querySelector('.temperature') as HTMLElement;

      city.innerText = `${locationList[0].name}, `;
      state.innerText = `${locationList[0].state}, `;
      country.innerText = `${locationList[0].country}`;
      // console.log(getWeatherData());
      temperature.innerText = `${temp} ${currentTempUnit}`;
    }
  }, [searchLocation]);

  // Globe code
  const globeEl = useRef(undefined);

  function getMapCoordinates(e: Coordinates) {
    console.log(e);

    setMapLat(e.lat);
    setMapLon(e.lng);
  }

  // Position globe to AU on mount
  useEffect(() => {
    if (globeEl.current) {
      (globeEl.current as GlobeMethods).pointOfView({
        lat: -20,
        lng: 140,
        altitude: 3,
      });
    }
  }, []);

  // useEffect(() => {
  //   console.log('Map Lat', mapLat);
  //   console.log('Map Lon', mapLon);
  // }, [mapLat, mapLon]);

  useEffect(() => {
    // clear any previous error messages
    const errorMessage = document.querySelector(
      '.error-message'
    ) as HTMLElement;
    errorMessage.innerText = ``;

    console.log('Current Coordinates are:', mapLat, mapLon);

    getWeatherForMap();

    async function getWeatherForMap() {
      console.log('run GetWeatherMap');

      const temp = await getWeatherDataForMap();

      console.log('Temperature', temp);

      if (temp) {
        renderForMap(temp);
      }
    }

    async function getWeatherDataForMap() {
      console.log('run getWeatherData');

      if (mapLat && mapLon) {
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${mapLat}&lon=${mapLon}&units=${currentUnitSystem}&appid=${key}`,
          {
            mode: 'cors',
          }
        );

        console.log('weatherResponse', weatherResponse);

        const weatherData = await weatherResponse.json();

        console.log('log weather data:');
        console.log(weatherData);
        console.log(weatherData.main.temp);

        return weatherData.main.temp;
      }
    }

    async function renderForMap(temp: number) {
      console.log('run render');
      const city = document.querySelector('.city') as HTMLElement;
      const state = document.querySelector('.state') as HTMLElement;
      const country = document.querySelector('.country') as HTMLElement;
      const temperature = document.querySelector('.temperature') as HTMLElement;

      // city.innerText = `Lat: ${mapLat}, `;
      // state.innerText = `Lon: ${mapLon}`;
      city.innerText = `${convertToCoordinates(mapLat as number, 'lat')}, `;
      state.innerText = `${convertToCoordinates(mapLon as number, 'lon')}`;
      country.innerText = '';
      temperature.innerText = `${temp} ${currentTempUnit}`;
    }
  }, [mapLat, mapLon]);

  // I want to update the temperature for the last location, previously it was
  // updating for the last search only as both use effects were being triggered

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

    console.log('Current Search Location is:', searchLocation);
    console.log('Current Coordinates are:', mapLat, mapLon);

    if (isNaN(parseInt(cityFirstChar))) {
      getWeather();
    } else {
      getWeatherForMap();
    }

    async function getWeatherForMap() {
      console.log('run GetWeatherMap');

      const temp = await getWeatherDataForMap();

      console.log('Temperature', temp);

      if (temp) {
        renderForMap(temp);
      }
    }

    async function getWeatherDataForMap() {
      console.log('run getWeatherData');

      if (mapLat && mapLon) {
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${mapLat}&lon=${mapLon}&units=${currentUnitSystem}&appid=${key}`,
          {
            mode: 'cors',
          }
        );

        console.log('weatherResponse', weatherResponse);

        const weatherData = await weatherResponse.json();

        console.log('log weather data:');
        console.log(weatherData);
        console.log(weatherData.main.temp);

        return weatherData.main.temp;
      }
    }

    async function renderForMap(temp: number) {
      console.log('run render');
      const city = document.querySelector('.city') as HTMLElement;
      const state = document.querySelector('.state') as HTMLElement;
      const country = document.querySelector('.country') as HTMLElement;
      const temperature = document.querySelector('.temperature') as HTMLElement;

      // city.innerText = `Lat: ${mapLat}, `;
      // state.innerText = `Lon: ${mapLon}`;
      city.innerText = `${convertToCoordinates(mapLat as number, 'lat')}, `;
      state.innerText = `${convertToCoordinates(mapLon as number, 'lon')}`;
      country.innerText = '';
      temperature.innerText = `${temp} ${currentTempUnit}`;
    }

    async function getWeather() {
      console.log('run GetWeather');

      const geoRequestInfo = await getGeoData();

      if (geoRequestInfo.ok) {
        if (geoRequestInfo.geoDataLength > 0) {
          const temp = await getWeatherData();

          console.log('Temperature', temp);

          render(temp);
        } else {
          console.log('handle empty getGeoData response');
          errorMessage.innerText = `The city you're searching for couldn't be found. Try again.`;
        }
      } else {
        console.log('handle bad getGeoData request');
        errorMessage.innerText = `The city you're searching for couldn't be found. Try again.`;
      }
    }

    async function getGeoData() {
      console.log('run getGeoData');
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

      console.log('geoResponse', geoResponse);

      // set lat and lon only if the request is ok
      if (geoResponse.ok) {
        console.log('geoData', geoData);

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
      console.log('run getWeatherData');
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${currentUnitSystem}&appid=${key}`,
        {
          mode: 'cors',
        }
      );

      console.log('weatherResponse', weatherResponse);

      const weatherData = await weatherResponse.json();

      console.log('log weather data:');
      console.log(weatherData);
      console.log(weatherData.main.temp);

      return weatherData.main.temp;
    }

    async function render(temp: number) {
      console.log('run render');
      const city = document.querySelector('.city') as HTMLElement;
      const state = document.querySelector('.state') as HTMLElement;
      const country = document.querySelector('.country') as HTMLElement;
      const temperature = document.querySelector('.temperature') as HTMLElement;

      city.innerText = `${locationList[0].name}, `;
      state.innerText = `${locationList[0].state}, `;
      country.innerText = `${locationList[0].country}`;
      // console.log(getWeatherData());
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
          {/* <div className="location-list">
            <select name="locations" id="locations">
              <option value="">---</option>
            </select>
          </div> */}
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
          globeImageUrl="/earth-blue-marble.jpg"
          showGraticules={true}
          showAtmosphere={false}
          onGlobeClick={getMapCoordinates}
          ref={globeEl}
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

/*
const locationDropDown = document.querySelector(
'#locations'
) as HTMLSelectElement;

locationDropDown?.addEventListener('change', getWeatherForSelection);
  
function getWeatherForSelection() {
    setLat(locationList[Number(locationDropDown.value)].lat);
    setLon(locationList[Number(locationDropDown.value)].lon);

    getWeatherData();
    render();
}

function addLocationList() {
// const selectLocations = document.querySelector('#locations');

// selectLocations?.replaceChildren();

// console.log(locationList.length);

for (let i = 0; i < locationList.length; i++) {
    const option = document.createElement('option');
    option.value = `${i}`;
    option.innerText = `${locationList[i].name}, ${locationList[i].state}, ${locationList[i].country}, lat: ${locationList[i].lat}, lon: ${locationList[i].lon}`;
    //   selectLocations?.appendChild(option);
}
}
*/
