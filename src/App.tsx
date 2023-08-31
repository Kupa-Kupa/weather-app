import './App.css';
import Header from './components/Header';

function App() {
  return (
    <main>
      <Header />
      <div className="max-w-screen-xl flex flex-col items-center">
        <label htmlFor="city-search" className="sr-only">
          Search
        </label>
        <input
          type="text"
          name="city-search"
          id="city-search"
          className="max-w-lg p-3 pl-10 block w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400"
          placeholder="Search for City"
        ></input>
      </div>
    </main>
  );
}

export default App;
