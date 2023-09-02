function Header() {
  return (
    <header>
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="max-w-2xl text-center mx-auto">
          <p className="inline-block text-md font-medium bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 text-transparent dark:from-blue-400 dark:to-violet-400">
            How about that weather...
          </p>

          <div className="mt-5 max-w-2xl">
            <h1 className="block font-semibold text-gray-800 text-4xl md:text-5xl lg:text-6xl dark:text-gray-200">
              Vite Weather App
            </h1>
          </div>

          <div className="mt-5 max-w-3xl">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Check the weather around the globe
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
