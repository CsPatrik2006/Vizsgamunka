import React, { useState } from "react";
import { Button } from "./button";

const Header = ({ 
  darkMode, 
  toggleTheme, 
  searchQuery, 
  setSearchQuery, 
  onSearch, 
  logo_dark, 
  logo_light 
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleDropdownToggle = () => {
    setDropdownOpen((prevState) => !prevState);
  };

  return (
    <header 
      className={`px-6 py-4 ${darkMode ? "bg-[#030507] text-white" : "bg-[#f8fafc] text-black"} shadow-md sticky top-0 z-20 overflow-visible`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <img
          src={darkMode ? logo_dark : logo_light}
          alt="Gumizz Logo"
          className="w-52 h-auto"
        />

        {/* Search Bar */}
        <div className="flex-grow mx-6">
          <div className="flex items-center bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <input
              type="text"
              placeholder="Szervízek böngészése..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 rounded-l-full text-black dark:text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-[#4e77f4]"
            />
            <button
              className="p-2 bg-[#5671c2] text-white rounded-r-full cursor-pointer"
              onClick={() => onSearch(searchQuery)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Icons (Cart, Account, Dark Mode) */}
        <div className="flex items-center space-x-6 relative">
          <Button className={`${darkMode ? "text-white" : "text-black"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
          </Button>

          {/* User Icon with Dropdown */}
          <Button onClick={handleDropdownToggle} className={`${darkMode ? "text-white" : "text-black"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </Button>

          {/* Dropdown for User (only when toggled) */}
          {dropdownOpen && (
            <div className="absolute right-0.5 mt-30 w-40 bg-white shadow-lg rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700 z-50 transform translate-y-2 opacity-100 transition-opacity duration-300 ease-in-out">
              <a href="/login">
                <button className="w-full text-center px-4 py-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-t-lg cursor-pointer">Bejelentkezés</button>
              </a>
              <a href="/register">
                <button className="w-full text-center px-4 py-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-b-lg cursor-pointer">Regisztráció</button>
              </a>
            </div>
          )}

          {/* Dark Mode Toggle */}
          <Button onClick={toggleTheme} className={`${darkMode ? "text-white" : "text-black"}`}>
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;