import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import Header from "../components/ui/navbar";
import { motion } from "framer-motion";
import logo_light from '../assets/logo_lightMode.png';
import logo_dark from '../assets/logo_darkMode.png';
import { useTheme } from '../context/ThemeContext';

const ProfilePage = ({ isLoggedIn, userData, handleLogout }) => {
  const { darkMode, themeLoaded } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserData = localStorage.getItem('userData');

    if (token && storedUserData) {
      setLoading(false);
    } else {
      // Redirect to home if not logged in
      navigate('/');
    }
  }, [navigate]);

  // Wait for both theme and user data to load
  if (!themeLoaded || loading) {
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
        handleLogout={handleLogout}
      />

      <section className="max-w-4xl mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`rounded-2xl shadow-lg p-8 ${darkMode ? "bg-[#252830]" : "bg-[#f1f5f9]"}`}
        >
          <div className="flex items-center mb-8">
            <div className="w-20 h-20 rounded-full bg-[#4e77f4] flex items-center justify-center text-white text-3xl mr-6">
              {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{userData.name}</h1>
              <p className="text-[#88a0e8]">{userData.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`p-6 rounded-xl ${darkMode ? "bg-[#1e2129]" : "bg-white"} shadow`}
            >
              <h2 className="text-xl font-semibold mb-4">Személyes adatok</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Teljes név</p>
                  <p className="font-medium">{userData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email cím</p>
                  <p className="font-medium">{userData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Telefonszám</p>
                  <p className="font-medium mb-4">{userData.phone || "Nincs megadva"}</p>
                </div>
              </div>
              <Button className="mt-6 bg-[#4e77f4] hover:bg-[#5570c2] text-white">
                Adatok szerkesztése
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={`p-6 rounded-xl ${darkMode ? "bg-[#1e2129]" : "bg-white"} shadow`}
            >
              <h2 className="text-xl font-semibold mb-4">Fiók beállítások</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Fiók létrehozva</p>
                  <p className="font-medium">2023. január 1.</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Utolsó bejelentkezés</p>
                  <p className="font-medium mb-4">Ma</p>
                </div>
              </div>
              <Button className="mt-6 bg-[#4e77f4] hover:bg-[#5570c2] text-white">
                Jelszó módosítása
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={`p-6 rounded-xl ${darkMode ? "bg-[#1e2129]" : "bg-white"} shadow`}
          >
            <h2 className="text-xl font-semibold mb-4">Aktivitás</h2>
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${darkMode ? "bg-[#252830]" : "bg-[#f8fafc]"}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Legutóbbi időpontfoglalás</h3>
                    <p className="text-sm text-[#88a0e8]">Nincs aktív időpontfoglalás</p>
                  </div>
                  <Button className="bg-[#4e77f4] hover:bg-[#5570c2] text-white">
                    Időpontfoglalás
                  </Button>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${darkMode ? "bg-[#252830]" : "bg-[#f8fafc]"}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Legutóbbi rendelés</h3>
                    <p className="text-sm text-[#88a0e8]">Nincs aktív rendelés</p>
                  </div>
                  <Button className="bg-[#4e77f4] hover:bg-[#5570c2] text-white">
                    Rendelés
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <footer className={`py-6 ${darkMode ? "bg-[#070708] text-[#f9fafc]" : "bg-[#f9fafc] text-black"} text-center`}>
        <p className="text-sm">&copy; 2025 Gumizz Kft. Minden jog fenntartva.</p>
        <div className="mt-2">
          <a href="#" className="text-sm text-[#4e77f4] hover:text-[#5570c2]">Adatvédelem</a> |
          <a href="#" className="text-sm text-[#4e77f4] hover:text-[#5570c2]"> Általános Szerződési Feltételek</a>
        </div>
      </footer>
    </div>
  );
};

export default ProfilePage;