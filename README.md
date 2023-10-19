# Weather Around The Globe

[Live Demo](https://kupa-kupa.github.io/weather-app/)

You can search for any city to check its current weather, or click anywhere on the globe to check the weather at those coordinates.

Weather data is obtained by making requests to OpenWeatherMap's Current Weather Data API and Location data is obtained by making requests to OpenWeatherMap's Geocoding API.

The globe visualisation is done with react-globe.gl.

This weather app was built using [Vite](https://vitejs.dev/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [OpenWeatherMap](https://openweathermap.org/current), [react-globe.gl](https://github.com/vasturiano/react-globe.gl) and [tailwindcss](https://tailwindcss.com/).

## Scripts

### dev

```
$ npm run dev
```

This script will run "[vite](https://vitejs.dev/guide/cli.html#vite)", which will start a local web server with [Hot Module Replacement](https://vitejs.dev/guide/features.html#hot-module-replacement) for development

### build

```
$ npm run build
```

This script will run "[tsc](https://www.typescriptlang.org/docs/handbook/compiler-options.html) && [vite build](https://vitejs.dev/guide/cli.html#vite-build)", and generate an application bundle in ./dist
