import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import Header from "../components/ui/navbar";
import ColorStripe from "../components/ui/navbarStripe";
import { motion } from "framer-motion";
import logo_light from '../assets/logo_lightMode.png';
import logo_dark from '../assets/logo_darkMode.png';
import LoginForm from './login';
import RegisterForm from './register';

export default function TyreShopHomepage() {
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  
  // Add authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Handle user logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setIsLoggedIn(false);
    setUserData(null);
  };

  // Check if user is logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserData = localStorage.getItem('userData');
    
    if (token && storedUserData) {
      setIsLoggedIn(true);
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  // Load theme preference on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    }
  }, []);

  // Save theme preference whenever it changes
  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Handle successful login
  const handleLoginSuccess = (userData, token) => {
    setIsLoggedIn(true);
    setUserData(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    setIsLoginOpen(false);
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-[#030507] text-[#f9fafc]" : "bg-[#f8fafc] text-black"} font-inter`}>
      <Header
        darkMode={darkMode}
        toggleTheme={toggleTheme}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        logo_dark={logo_dark}
        logo_light={logo_light}
        setIsLoginOpen={setIsLoginOpen}
        setIsRegisterOpen={setIsRegisterOpen}
        isLoggedIn={isLoggedIn}
        userData={userData}
        handleLogout={handleLogout}
      />
      <div className="z-10 sticky top-36.5">
        <ColorStripe />
      </div>

      <section className="flex flex-col items-center justify-center text-center py-20 px-5">
        <motion.h1
          className="text-5xl font-bold mb-4"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
        >
          Prémium Abroncsok, Személyreszabott szolgáltatások
        </motion.h1>

        <motion.p
          className="text-lg text-[#88a0e8] max-w-2xl mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
        >
          Találd meg a járművedhez legjobban illő abroncsokat és foglalj időpontot a hozzád legközelebbi szervízhez.
        </motion.p>

        <motion.div
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <Button className="mt-6 bg-[#4e77f4] hover:bg-[#5570c2] text-white px-6 py-3 rounded-2xl text-lg shadow-lg">
            Tovább a webshopra
          </Button>
        </motion.div>
      </section>

      <section className="py-16 px-5">
        <h2 className="text-3xl font-semibold text-center mb-8">Kiemelet ajánlatok</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[1, 2, 3].map((_, index) => (
            <motion.div
              key={index}
              className={`p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform ${darkMode ? "bg-[#252830]" : "bg-[#f1f5f9]"}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
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

      <section className={`${darkMode ? "bg-[#030507]" : "bg-[#f9fafc]"} py-16 px-5`}>
        <h2 className="text-3xl font-semibold text-center mb-8">Szolgáltatásaink</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {["Gumiabroncs Felszerelés", "Centrírozás", "Futómű Beállítás"].map((service, index) => (
            <motion.div
              key={index}
              className={`p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform ${darkMode ? "bg-[#252830]" : "bg-[#f1f5f9]"}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.2 }}
            >
              <h3 className="text-xl font-semibold mb-2">{service}</h3>
              <p className="text-[#88a0e8]">Szakképzett szerelők által végzett megbízható {service.toLowerCase()}.</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-16 px-5">
        <h2 className="text-3xl font-semibold text-center mb-8">Vásárlóink véleményei</h2>
        <div className="max-w-4xl mx-auto text-center mb-8">
          <motion.p
            className="text-lg text-[#88a0e8] italic"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
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
            viewport={{ once: true, amount: 0.2 }}
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
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
          >
            "Nagyon ajánlom! Az abroncsok kiválasztása egyszerű volt, és gyorsan meg is érkeztek."
          </motion.p>
          <p className="mt-4 font-semibold">- Tóth László</p>
        </div>
      </section>

      <section className={`${darkMode ? "bg-[#030507]" : "bg-[#f9fafc]"} py-16 px-5 text-center`}>
        <h2 className="text-3xl font-semibold mb-6">Foglalj Időpontot</h2>
        <p className="text-lg text-[#88a0e8] mb-6">Tervezd meg a számódra legmegfelelőbb időpontot!</p>
        <Button className="bg-[#4e77f4] hover:bg-[#5570c2] text-white px-6 py-3 rounded-2xl text-lg shadow-lg">
          Időpontfoglalás
        </Button>
      </section>

      <footer className={`py-6 ${darkMode ? "bg-[#070708] text-[#f9fafc]" : "bg-[#f9fafc] text-black"} text-center`}>
        <p className="text-sm">&copy; 2025 Gumizz Kft. Minden jog fenntartva.</p>
        <div className="mt-2">
          <a href="#" className="text-sm text-[#4e77f4] hover:text-[#5570c2]">Adatvédelem</a> | 
          <a href="#" className="text-sm text-[#4e77f4] hover:text-[#5570c2]"> Általános Szerződési Feltételek</a>
              </div>
                      </footer>

                      <LoginForm 
                        isOpen={isLoginOpen} 
                        onClose={() => setIsLoginOpen(false)} 
                        setIsRegisterOpen={setIsRegisterOpen} 
                        darkMode={darkMode}
                        onLoginSuccess={handleLoginSuccess}
                      />
            <RegisterForm isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} setIsLoginOpen={setIsLoginOpen} darkMode={darkMode} />
    </div>
  );
}
