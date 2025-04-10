import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import Header from "../components/ui/navbar";
import Footer from "../components/ui/Footer";
import { motion } from "framer-motion";
import logo_light from '../assets/logo_lightMode.png';
import logo_dark from '../assets/logo_darkMode.png';

const CheckoutSuccess = ({ isLoggedIn, userData, handleLogout }) => {
  const { darkMode, themeLoaded } = useTheme();
  const { handleCartLogout } = useCart();
  const location = useLocation();
  const { orderId, hasAppointment } = location.state || { orderId: null, hasAppointment: false };
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogoutWithCartClear = () => {
    handleCartLogout();
    handleLogout();
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!themeLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-800 text-white">
        <div className="text-xl">Betöltés...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? "bg-[#030507] text-[#f9fafc]" : "bg-[#f8fafc] text-black"} font-inter`}>
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        logo_dark={logo_dark}
        logo_light={logo_light}
        isLoggedIn={isLoggedIn}
        userData={userData}
        handleLogout={handleLogoutWithCartClear}
      />

      <section className="max-w-4xl mx-auto py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`rounded-2xl shadow-lg p-8 ${darkMode ? "bg-[#1e2129]" : "bg-white"}`}
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-3xl font-bold mb-4"
            >
              Rendelés sikeresen leadva!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className={`text-lg mb-8 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Köszönjük a rendelését! A visszaigazolást elküldtük e-mailben.
              {orderId && <span> Az Ön rendelési azonosítója: <strong>#{orderId}</strong></span>}
            </motion.p>

            {hasAppointment && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className={`p-6 mb-8 rounded-xl ${darkMode ? "bg-[#252830]" : "bg-gray-100"}`}
              >
                <div className="flex items-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#4e77f4] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h2 className="text-xl font-semibold">Időpontfoglalás megerősítve</h2>
                </div>
                <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                  Az időpontfoglalását rögzítettük. Kérjük, érkezzen pontosan a foglalt időpontra.
                  A szerviz munkatársai várni fogják Önt.
                </p>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6"
            >
              <Link
                to="/"
                className="px-6 py-3 bg-[#4e77f4] hover:bg-[#3a5fc7] text-white rounded-lg transition-colors flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7m-7-7v14" />
                </svg>
                Vissza a főoldalra
              </Link>

              <Link
                to="/profile"
                className={`px-6 py-3 rounded-lg transition-colors flex items-center justify-center ${darkMode
                  ? "bg-[#252830] hover:bg-[#1e2129] text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profil megtekintése
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>
      <Footer />
    </div>
  );
};

export default CheckoutSuccess;