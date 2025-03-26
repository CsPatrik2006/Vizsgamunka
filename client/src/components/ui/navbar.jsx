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
  const [services, setServices] = useState([]);

  // Fetch garages and services for suggestions
  useEffect(() => {
    const fetchSuggestionData = async () => {
      try {
        const garagesResponse = await axios.get('http://localhost:3000/garages');
        const servicesResponse = await axios.get('http://localhost:3000/services');

        setGarages(garagesResponse.data);
        setServices(servicesResponse.data);
      } catch (error) {
        console.error('Error fetching suggestion data:', error);
      }
    };

    fetchSuggestionData();
  }, []);

  // Generate suggestions based on search query - only for garages and services
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      setLoading(true);
      const query = searchQuery.toLowerCase();

      // Filter garages
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

      // Filter services
      const matchingServices = services
        .filter(service =>
          service.name.toLowerCase().includes(query) ||
          (service.description && service.description.toLowerCase().includes(query))
        )
        .map(service => {
          const garage = garages.find(g => g.id === service.garage_id);
          return {
            id: service.id,
            text: service.name,
            type: 'service',
            subtext: garage ? `${garage.name}` : 'Ismeretlen szervíz'
          };
        });

      // Combine and limit results
      const combinedSuggestions = [...matchingGarages, ...matchingServices].slice(0, 5);
      setSuggestions(combinedSuggestions);
      setShowSuggestions(true);
      setLoading(false);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, garages, services]);

  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleCartToggle = () => {
    setCartOpen(!cartOpen);
  };

  const handleLoginClick = () => {
    setIsLoginOpen && setIsLoginOpen(true);
    setDropdownOpen(false);
  };

  const handleRegisterClick = () => {
    setIsRegisterOpen && setIsRegisterOpen(true);
    setDropdownOpen(false);
  };

  const handleUserLogout = () => {
    handleLogout();
    setDropdownOpen(false);
  };

  // Handle search submission - now just shows dropdown, doesn't redirect
  const handleSearch = (e) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      // Just show the suggestions dropdown with results
      setShowSuggestions(true);
    } else {
      // Close the suggestions dropdown for empty searches
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click - navigate directly to the specific item
  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'garage') {
      navigate(`/shop?garage=${suggestion.id}`);
    } else if (suggestion.type === 'service') {
      navigate(`/shop?service=${suggestion.id}`);
    }
    setSearchQuery(''); // Clear search after navigating
    setShowSuggestions(false);
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Don't render until theme is loaded
  if (!themeLoaded) {
    return null;
  }

  return (
    <div className="sticky top-0 z-20">
      <header
        className={`px-6 py-4 ${darkMode ? "bg-[#030507] text-white" : "bg-[#f8fafc] text-black"} shadow-md overflow-visible`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="cursor-pointer">
            <img
              src={darkMode ? logo_dark : logo_light}
              alt="Gumizz Logo"
              className="w-52 h-auto"
            />
          </Link>

          <div className="flex-grow mx-6 relative">
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

            {/* Suggestions dropdown - only for garages and services */}
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
                          <div className={`mr-2 ${suggestion.type === 'garage' ? 'text-blue-500' : 'text-green-500'}`}>
                            {suggestion.type === 'garage' ? (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5.5-1.5-.5M6.75 7.364V3h-3v18m3-13.636 10.5-3.819" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <div className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                              {suggestion.text}
                            </div>
                            <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                              {suggestion.type === 'garage' ? 'Szervíz' : 'Szolgáltatás'} • {suggestion.subtext}
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
                  // No results message
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

          {/* Icons (User, Cart, Dark Mode) */}
          <div className="flex items-center space-x-6 relative">
            {/* User Button */}
            <div className="relative">
              <Button onClick={handleDropdownToggle} className={`${darkMode ? "text-white" : "text-black"} flex items-center relative`}>
                {isLoggedIn && userData ? (
                  <div className="relative flex items-center justify-center w-6 h-6 overflow-visible">
                    <div className="absolute w-7 h-7 rounded-full bg-[#4e77f4] flex items-center justify-center text-white text-sm transform scale-110">
                      {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  </div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                )}
              </Button>

              {/* User Dropdown */}
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
                        {userData.name || "User"}
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

            {/* Cart Button - Updated to use cartItems from context with fixed positioning */}
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
      <ColorStripe />

      {/* Cart Sidebar - Pass cartItems from context */}
      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
      />
    </div>
  );
};

export default Header;