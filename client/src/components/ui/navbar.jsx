import React, { useState } from "react";
import { Button } from "./button";
import { Link } from "react-router-dom";
import { useTheme } from '../../context/ThemeContext';
import CartSidebar from "./CartSidebar"; // Import the new component

const Header = ({
  searchQuery,
  setSearchQuery,
  onSearch,
  logo_dark,
  logo_light,
  setIsLoginOpen,
  setIsRegisterOpen,
  isLoggedIn,
  userData,
  handleLogout
}) => {
  const { darkMode, toggleTheme, themeLoaded } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false); // New state for cart sidebar

  // Sample cart items - in a real app, this would come from a cart context or props
  const [cartItems, setCartItems] = useState([
    // Example items - replace with actual data in your implementation
    // {
    //   id: 1,
    //   name: "Olajcsere",
    //   product_type: "service",
    //   quantity: 1,
    //   price: 15000
    // },
    // {
    //   id: 2,
    //   name: "Téli gumi",
    //   product_type: "inventory",
    //   quantity: 4,
    //   price: 25000
    // }
  ]);

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

  // Don't render until theme is loaded
  if (!themeLoaded) {
    return null;
  }

  return (
    <>
      <header
        className={`px-6 py-4 ${darkMode ? "bg-[#030507] text-white" : "bg-[#f8fafc] text-black"} shadow-md sticky top-0 z-20 overflow-visible`}
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

          {/* Search Bar */}
          <div className="flex-grow mx-6">
            <div className="flex items-center bg-[#252830] dark:bg-[#252830] rounded-full overflow-hidden">
              <input
                type="text"
                placeholder="Szervízek böngészése..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 rounded-l-full text-black dark:text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-[#4e77f4]"
              />
              <button
                className="p-2 bg-[#5671c2] text-white rounded-r-full cursor-pointer"
                onClick={() => onSearch && onSearch(searchQuery)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Icons (User, Cart, Dark Mode) - Swapped user and cart positions */}
          <div className="flex items-center space-x-6 relative">
            {/* User Button - Now first */}
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

              {/* Dropdown positioned centered under the user button */}
              <div
                className={`absolute transform -translate-x-1/2 left-1/2 top-12 shadow-lg rounded-lg border 
                ${darkMode
                    ? "bg-[#252830] border-[#252830] text-white"
                    : "bg-white border-gray-200 text-gray-800"
                  } z-50 transition-all duration-300 ease-in-out origin-top
                ${isLoggedIn && userData ? "w-48" : "w-32"}
                ${dropdownOpen
                    ? 'opacity-100 scale-y-100 translate-y-0'
                    : 'opacity-0 scale-y-0 -translate-y-2 pointer-events-none'
                  }`}
              >
                {isLoggedIn && userData ? (
                  // Logged-in user dropdown
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
                    <a
                      href="/appointments"
                      className={`block px-4 py-2 text-sm ${darkMode
                        ? "text-white hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-100"
                        } cursor-pointer`}
                    >
                      Időpontjaim
                    </a>
                    <a
                      href="/orders"
                      className={`block px-4 py-2 text-sm ${darkMode
                        ? "text-white hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-100"
                        } cursor-pointer`}
                    >
                      Rendeléseim
                    </a>
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
                  // Non-logged-in user dropdown
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

            {/* Cart Button - Now second */}
            <Button 
              onClick={handleCartToggle} 
              className={`${darkMode ? "text-white" : "text-black"} relative`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Button>
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

      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={cartOpen} 
        onClose={() => setCartOpen(false)} 
        cartItems={cartItems} 
      />
    </>
  );
};

export default Header;