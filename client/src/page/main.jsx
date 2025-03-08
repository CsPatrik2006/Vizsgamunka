import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import logo_light from '../assets/logo_lightMode.png';
import logo_dark from '../assets/logo_darkMode.png';

export default function TyreShopHomepage() {
  // State for managing theme and search query
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Toggle dark mode
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Effect to load the saved theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    }
  }, []);

  // Effect to save theme to localStorage
  useEffect(() => {
    if (darkMode) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <div className={`min-h-screen ${darkMode ? "bg-[#030507] text-[#f9fafc]" : "bg-[#f8fafc] text-black"} font-inter`}>
      {/* Header with Navbar */}
      <header className={`px-6 py-4 ${darkMode ? "bg-[#030507] text-white" : "bg-[#f8fafc] text-black"} shadow-md`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <img
            src={darkMode ? logo_dark : logo_light}
            alt="TyreShop Logo"
            className="w-52 h-auto"
          />

          {/* Search Bar */}
          <div className="flex-grow mx-6">
            <div className="flex items-center bg-[#f1f5f9] dark:bg-[#252830] rounded-full overflow-hidden">
              <input
                type="text"
                placeholder="Szervízek böngészése..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full p-2 rounded-l-full text-black dark:text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-[#4e77f4]`}
              />
              <button
                className="p-2 bg-[#5671c2] text-white rounded-r-full cursor-pointer"
                onClick={() => console.log(searchQuery)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {/* Cart and Account Buttons */}
            <Button className={`${darkMode ? "text-white" : "text-black"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
            </Button>

            <Button className={`${darkMode ? "text-white" : "text-black"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </Button>

            {/* Dark Mode Toggle */}
            <Button onClick={toggleTheme} className={`${darkMode ? "text-white" : "text-black"}`}>
              {darkMode ? (
                // Moon icon (dark mode is active)
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
              ) : (
                // Sun icon (light mode is active)
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Navbar Color Stripe */}
      <div className="h-1 bg-gradient-to-r from-[#5570c2] via-[#88a0e8] to-[#4e77f4]" />

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-5">
        <motion.h1
          className="text-5xl font-bold mb-4"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }} // Trigger animation when 20% of the element is in view
          transition={{ duration: 0.8 }}
        >
          Prémium Abroncsok, Személyreszabott szolgáltatások
        </motion.h1>

        <motion.p
          className="text-lg text-[#88a0e8] max-w-2xl mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }} // Trigger animation when 20% of the element is in view
          transition={{ duration: 0.8 }}
        >
          Találd meg a járművedhez legjobban illő abroncsokat és foglalj időpontot a hozzád legközelebbi szervízhez.
        </motion.p>

        <motion.div
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }} // Trigger animation when 20% of the element is in view
        >
          <Button className="mt-6 bg-[#4e77f4] hover:bg-[#5570c2] text-white px-6 py-3 rounded-2xl text-lg shadow-lg">
            További információ
          </Button>
        </motion.div>
      </section>


      {/* Featured Products */}
      <section className="py-16 px-5">
        <h2 className="text-3xl font-semibold text-center mb-8">Kiemelet ajánlatok</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[1, 2, 3].map((_, index) => (
            <motion.div
              key={index}
              className={`p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform ${darkMode ? "bg-[#1c1e22]" : "bg-[#f1f5f9]"}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }} // Trigger the animation when 20% of the element is in view
              transition={{ delay: index * 0.2 }}
            >
              <div className="h-40 bg-gray-700 rounded-xl mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Tyre Model {index + 1}</h3>
              <p className="text-[#88a0e8] mb-8">High-performance, durable tyres for your needs.</p>
              <Button className="mt-4 bg-[#4e77f4] hover:bg-[#5570c2] text-white px-4 py-2 rounded-xl">
                Adatlap
              </Button>
            </motion.div>
          ))}
        </div>
      </section>

     {/* Services Section */}
     <section className={`${darkMode ? "bg-[#030507]" : "bg-[#f9fafc]"} py-16 px-5`}>
      <h2 className="text-3xl font-semibold text-center mb-8">Szolgáltatásaink</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {["Gumiabroncs Felszerelés", "Centrírozás", "Futómű Beállítás"].map((service, index) => (
          <motion.div
            key={index}
            className={`p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform ${darkMode ? "bg-[#252830]" : "bg-[#f1f5f9]"}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }} // Trigger the animation when 20% of the element is in view
            transition={{ delay: index * 0.2 }}
          >
            <h3 className="text-xl font-semibold mb-2">{service}</h3>
            <p className="text-[#88a0e8]">Szakképzett szerelők által végzett megbízható {service.toLowerCase()}.</p>
          </motion.div>
        ))}
      </div>
     </section>


      {/* Testimonials Section */}
      <section className="py-16 px-5">
        <h2 className="text-3xl font-semibold text-center mb-8">Vásárlóink véleményei</h2>
        <div className="max-w-4xl mx-auto text-center mb-8">
          <motion.p
            className="text-lg text-[#88a0e8] italic"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }} // Trigger the animation when 20% of the element is in view
            transition={{ duration: 0.8 }}
          >
            "Remek szolgáltatások és jó minőségű termékek! Az időpontfoglalás is zökkenőmentes és egyszerű. Csak ajánlani tudom!"
          </motion.p>
          <p className="mt-4 font-semibold">- Gipsz Jakab</p>
        </div>
        <div className="max-w-4xl mx-auto text-center mb-8">
          <motion.p
            className="text-lg text-[#88a0e8] italic"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }} // Trigger the animation when 20% of the element is in view
            transition={{ duration: 0.8 }}
          >
            "Már többször is igénybe vettem a szolgáltatásaikat, mindig elégedett voltam. Nagyon segítőkészek és gyorsak!"
          </motion.p>
          <p className="mt-4 font-semibold">- Szabó Anna</p>
        </div>
        <div className="max-w-4xl mx-auto text-center mb-8">
          <motion.p
            className="text-lg text-[#88a0e8] italic"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }} // Trigger the animation when 20% of the element is in view
            transition={{ duration: 0.8 }}
          >
            "Nagyon ajánlom! Az abroncsok kiválasztása egyszerű volt, és gyorsan meg is érkeztek."
          </motion.p>
          <p className="mt-4 font-semibold">- Tóth László</p>
        </div>
      </section>

      {/* Appointment Booking */}
      <section className={`${darkMode ? "bg-[#030507]" : "bg-[#f9fafc]"} py-16 px-5 text-center`}>
        <h2 className="text-3xl font-semibold mb-6">Foglalj Időpontot</h2>
        <p className="text-lg text-[#88a0e8] mb-6">Tervezd meg a számódra legmegfelelőbb időpontot!</p>
        <Button className="bg-[#4e77f4] hover:bg-[#5570c2] text-white px-6 py-3 rounded-2xl text-lg shadow-lg">
          Időpontfoglalás
        </Button>
      </section>

      {/* Footer */}
      <footer className={`py-6 ${darkMode ? "bg-[#070708] text-[#f9fafc]" : "bg-[#f9fafc] text-black"} text-center`}>
        <p className="text-sm">&copy; 2025 Gumizz Kft. Minden jog fenntartva.</p>
        <div className="mt-2">
          <a href="#" className="text-sm text-[#4e77f4] hover:text-[#5570c2]">Adatvédelem</a> | 
          <a href="#" className="text-sm text-[#4e77f4] hover:text-[#5570c2]"> Általános Szerződési Feltételek</a>
        </div>
      </footer>
    </div>
  );
}
