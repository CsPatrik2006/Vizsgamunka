import React, { useState, useEffect } from "react";
import { Button } from "./button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import CartSidebar from "./CartSidebar";
import ColorStripe from "./navbarStripe";
import axios from 'axios';

const Header = ({
  searchQuery,
  setSearchQuery,
  logo_dark,
  logo_light,
  setIsLoginOpen,
  setIsRegisterOpen,
  isLoggedIn,
  userData,
  handleLogout
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleTheme, themeLoaded } = useTheme();
  const { cartItems } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [garages, setGarages] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchSuggestionData = async () => {
      try {
        const garagesResponse = await axios.get('http://localhost:3000/garages');
        setGarages(garagesResponse.data);
      } catch (error) {
        console.error('Error fetching suggestion data:', error);
      }
    };

    fetchSuggestionData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      setLoading(true);
      const query = searchQuery.toLowerCase();

      const matchingGarages = garages
        .filter(garage =>
          garage.name.toLowerCase().includes(query) ||
          garage.location.toLowerCase().includes(query)
        )
        .map(garage => ({
          id: garage.id,
          text: garage.name,
          type: 'garage',
          subtext: garage.location
        }));

      const combinedSuggestions = matchingGarages.slice(0, 5);
      setSuggestions(combinedSuggestions);
      setShowSuggestions(true);
      setLoading(false);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, garages]);

  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleCartToggle = () => {
    setCartOpen(!cartOpen);
    setMobileMenuOpen(false);
  };

  const getProfilePicture = () => {
    if (isLoggedIn && userData && userData.profile_picture) {
      return `http://localhost:3000${userData.profile_picture}`;
    }
    return null;
  };

  const profilePicture = getProfilePicture();

  const handleLoginClick = () => {
    setIsLoginOpen && setIsLoginOpen(true);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleRegisterClick = () => {
    setIsRegisterOpen && setIsRegisterOpen(true);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleUserLogout = () => {
    handleLogout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (!mobileMenuOpen) {
      setDropdownOpen(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'garage') {
      navigate(`/shop?garage=${suggestion.id}`);
    }
    setSearchQuery('');
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.mobile-menu-container') && !e.target.closest('.hamburger-button')) {
        setMobileMenuOpen(false);
      }
      setShowSuggestions(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  if (!themeLoaded) {
    return null;
  }

  return (
    <div className="sticky top-0 z-20">
      <header
        className={`px-6 py-4 ${darkMode ? "bg-[#030507] text-white" : "bg-[#f8fafc] text-black"} shadow-md overflow-visible`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="cursor-pointer">
            <img
              src={darkMode ? logo_dark : logo_light}
              alt="Gumizz Logo"
              className="w-52 h-auto"
            />
          </Link>

          <div className="flex-grow mx-6 relative hidden md:block">
            <form onSubmit={handleSearch} className="w-full">
              <div className={`flex items-center ${darkMode ? "bg-[#252830]" : "bg-gray-200"} rounded-full overflow-hidden`}>
                <input
                  type="text"
                  placeholder="Szervízek keresése..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (searchQuery.trim().length > 1) {
                      setShowSuggestions(true);
                    }
                  }}
                  className={`w-full p-2 rounded-l-full ${darkMode ? "text-white" : "text-black"} bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-[#4e77f4] ${darkMode ? "placeholder-gray-400" : "placeholder-gray-500"}`}
                />
                <button
                  type="submit"
                  className="p-2 bg-[#5671c2] text-white rounded-r-full cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </button>
              </div>
            </form>

            {showSuggestions && (
              <div
                className={`absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg z-50 ${darkMode ? "bg-[#252830] border border-[#353b48]" : "bg-white border border-gray-200"}`}
                onClick={(e) => e.stopPropagation()}
              >
                {loading ? (
                  <div className={`p-3 text-center ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Keresés...
                  </div>
                ) : suggestions.length > 0 ? (
                  <ul>
                    {suggestions.map((suggestion, index) => (
                      <li
                        key={`${suggestion.type}-${suggestion.id}`}
                        className={`px-4 py-2 cursor-pointer ${darkMode ? "hover:bg-[#353b48]" : "hover:bg-gray-100"} ${index !== suggestions.length - 1 ? `border-b ${darkMode ? "border-[#353b48]" : "border-gray-200"}` : ""}`}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <div className="flex items-center">
                          <div className={`mr-2 text-blue-500`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5.5-1.5-.5M6.75 7.364V3h-3v18m3-13.636 10.5-3.819" />
                            </svg>
                          </div>
                          <div>
                            <div className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                              {suggestion.text}
                            </div>
                            <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                              Szervíz • {suggestion.subtext}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                    <li
                      className={`px-4 py-2 text-center cursor-pointer ${darkMode ? "text-[#4e77f4] hover:bg-[#353b48]" : "text-[#4e77f4] hover:bg-gray-100"}`}
                      onClick={() => navigate('/shop')}
                    >
                      Összes szervíz megtekintése
                    </li>
                  </ul>
                ) : searchQuery.trim().length > 1 ? (
                  <div className={`p-4 text-center ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Nincs találat a keresési feltételeknek megfelelően.
                    <div className="mt-2">
                      <button
                        className={`text-sm ${darkMode ? "text-[#4e77f4] hover:text-[#5570c2]" : "text-[#4e77f4] hover:text-[#5570c2]"}`}
                        onClick={() => navigate('/shop')}
                      >
                        Összes szervíz megtekintése
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="md:hidden flex-grow mx-2">
            <form onSubmit={handleSearch} className="w-full">
              <div className={`flex items-center ${darkMode ? "bg-[#252830]" : "bg-gray-200"} rounded-full overflow-hidden`}>
                <input
                  type="text"
                  placeholder="Keresés..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (searchQuery.trim().length > 1) {
                      setShowSuggestions(true);
                    }
                  }}
                  className={`w-full p-2 rounded-l-full ${darkMode ? "text-white" : "text-black"} bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-[#4e77f4] ${darkMode ? "placeholder-gray-400" : "placeholder-gray-500"}`}
                />
                <button
                  type="submit"
                  className="p-2 bg-[#5671c2] text-white rounded-r-full cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </button>
              </div>
            </form>

            {showSuggestions && (
              <div
                className={`absolute left-6 right-6 mt-1 rounded-lg shadow-lg z-50 ${darkMode ? "bg-[#252830] border border-[#353b48]" : "bg-white border border-gray-200"}`}
                onClick={(e) => e.stopPropagation()}
              >
                {loading ? (
                  <div className={`p-3 text-center ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Keresés...
                  </div>
                ) : suggestions.length > 0 ? (
                  <ul>
                    {suggestions.map((suggestion, index) => (
                      <li
                        key={`${suggestion.type}-${suggestion.id}`}
                        className={`px-4 py-2 cursor-pointer ${darkMode ? "hover:bg-[#353b48]" : "hover:bg-gray-100"} ${index !== suggestions.length - 1 ? `border-b ${darkMode ? "border-[#353b48]" : "border-gray-200"}` : ""}`}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <div className="flex items-center">
                          <div className={`mr-2 text-blue-500`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5.5-1.5-.5M6.75 7.364V3h-3v18m3-13.636 10.5-3.819" />
                            </svg>
                          </div>
                          <div>
                            <div className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                              {suggestion.text}
                            </div>
                            <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                              Szervíz • {suggestion.subtext}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                    <li
                      className={`px-4 py-2 text-center cursor-pointer ${darkMode ? "text-[#4e77f4] hover:bg-[#353b48]" : "text-[#4e77f4] hover:bg-gray-100"}`}
                      onClick={() => navigate('/shop')}
                    >
                      Összes szervíz megtekintése
                    </li>
                  </ul>
                ) : searchQuery.trim().length > 1 ? (
                  <div className={`p-4 text-center ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Nincs találat a keresési feltételeknek megfelelően.
                    <div className="mt-2">
                      <button
                        className={`text-sm ${darkMode ? "text-[#4e77f4] hover:text-[#5570c2]" : "text-[#4e77f4] hover:text-[#5570c2]"}`}
                        onClick={() => navigate('/shop')}
                      >
                        Összes szervíz megtekintése
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-6 relative">
            <div className="relative">
              <Button onClick={handleDropdownToggle} className={`${darkMode ? "text-white" : "text-black"} flex items-center relative`}>
                {isLoggedIn && userData ? (
                  <div className="relative flex items-center justify-center w-6 h-6 overflow-visible">
                    <div className="absolute w-7 h-7 rounded-full bg-[#4e77f4] flex items-center justify-center text-white text-sm transform scale-110 overflow-hidden">
                      {userData.profile_picture ? (
                        <img
                          src={`http://localhost:3000${userData.profile_picture}`}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        userData.first_name ? userData.first_name.charAt(0).toUpperCase() : "U"
                      )}
                    </div>
                  </div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                )}
              </Button>

              <div
                className={`absolute transform -translate-x-1/2 left-1/2 top-12 shadow-lg rounded-lg border 
                ${darkMode
                    ? "bg-[#252830] border-[#252830] text-white"
                    : "bg-white border-gray-200 text-gray-800"
                  } z-30 transition-all duration-300 ease-in-out origin-top
                ${isLoggedIn && userData ? "w-48" : "w-32"}
                ${dropdownOpen
                    ? 'opacity-100 scale-y-100 translate-y-0'
                    : 'opacity-0 scale-y-0 -translate-y-2 pointer-events-none'
                  }`}
              >
                {isLoggedIn && userData ? (
                  <>
                    <div className={`px-4 py-3 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                      <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {userData.last_name} {userData.first_name || "User"}
                      </p>
                      <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"} truncate`}>
                        {userData.email}
                      </p>
                    </div>
                    <a
                      href="/profile"
                      className={`block px-4 py-2 text-sm ${darkMode
                        ? "text-white hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-100"
                        } cursor-pointer`}
                    >
                      Profilom
                    </a>
                    {userData.role === "garage_owner" && (
                      <Link
                        to="/my-garages"
                        className={`block px-4 py-2 text-sm ${darkMode
                          ? "text-white hover:bg-gray-700"
                          : "text-gray-700 hover:bg-gray-100"
                          } cursor-pointer`}
                      >
                        Garázsaim
                      </Link>
                    )}
                    <button
                      onClick={handleUserLogout}
                      className={`block w-full text-left px-4 py-2 text-sm text-red-600 ${darkMode
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-100"
                        } cursor-pointer rounded-b-lg`}
                    >
                      Kijelentkezés
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleLoginClick}
                      className={`w-full text-left px-4 py-2 text-sm ${darkMode
                        ? "text-white hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-100"
                        } rounded-t-lg cursor-pointer`}
                    >
                      Bejelentkezés
                    </button>
                    <button
                      onClick={handleRegisterClick}
                      className={`w-full text-left px-4 py-2 text-sm ${darkMode
                        ? "text-white hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-100"
                        } rounded-b-lg cursor-pointer`}
                    >
                      Regisztráció
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="relative inline-block">
              <Button
                onClick={handleCartToggle}
                className={`${darkMode ? "text-white" : "text-black"} relative`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
              </Button>
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </div>

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

          <div className="md:hidden relative">
            <button
              onClick={toggleMobileMenu}
              className={`hamburger-button p-2 rounded-md cursor-pointer ${darkMode ? "text-white hover:bg-gray-700" : "text-black hover:bg-gray-200"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#5671c2" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            <div
              className={`mobile-menu-container absolute right-0 top-12 w-56 shadow-lg rounded-lg border 
            ${darkMode ? "bg-[#252830] border-[#353b48] text-white" : "bg-white border-gray-200 text-gray-800"} 
            z-30 transition-all duration-300 ease-in-out origin-top-right
            ${mobileMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
            >

              {isLoggedIn && userData && (
                <div className={`px-4 py-3 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-[#4e77f4] flex items-center justify-center text-white">
                        {userData.profile_picture ? (
                          <img
                            src={`http://localhost:3000${userData.profile_picture}`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          userData.first_name ? userData.first_name.charAt(0).toUpperCase() : "U"
                        )}
                      </div>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {userData.last_name} {userData.first_name || "User"}
                      </p>
                      <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"} truncate`}>
                        {userData.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="py-1">
                <button
                  onClick={handleCartToggle}
                  className={`flex items-center w-full cursor-pointer px-4 py-2 text-sm ${darkMode ? "text-white hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                  </svg>
                  Kosár
                  {cartItems.length > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={toggleTheme}
                  className={`flex items-center w-full cursor-pointer px-4 py-2 text-sm ${darkMode ? "text-white hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`}
                >
                  {darkMode ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                      </svg>
                      Világos mód
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                      </svg>
                      Sötét mód
                    </>
                  )}
                </button>

                {isLoggedIn && userData ? (
                  <>
                    <div className={`border-t ${darkMode ? "border-gray-700" : "border-gray-200"} my-1`}></div>
                    <a
                      href="/profile"
                      className={`flex items-center px-4 py-2 text-sm ${darkMode ? "text-white hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                      Profilom
                    </a>
                    {userData.role === "garage_owner" && (
                      <Link
                        to="/my-garages"
                        className={`flex items-center px-4 py-2 text-sm ${darkMode ? "text-white hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5.5-1.5-.5M6.75 7.364V3h-3v18m3-13.636 10.5-3.819" />
                        </svg>
                        Garázsaim
                      </Link>
                    )}
                    <button
                      onClick={handleUserLogout}
                      className={`flex items-center w-full cursor-pointer px-4 py-2 text-sm text-red-600 ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                      </svg>
                      Kijelentkezés
                    </button>
                  </>
                ) : (
                  <>
                    <div className={`border-t ${darkMode ? "border-gray-700" : "border-gray-200"} my-1`}></div>
                    <button
                      onClick={handleLoginClick}
                      className={`flex items-center w-full px-4 py-2 text-sm ${darkMode ? "text-white hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                      </svg>
                      Bejelentkezés
                    </button>
                    <button
                      onClick={handleRegisterClick}
                      className={`flex items-center w-full px-4 py-2 text-sm ${darkMode ? "text-white hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                      </svg>
                      Regisztráció
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      <ColorStripe />

      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
      />
    </div>
  );
};

export default Header;