import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import { useCart } from '../context/CartContext';
import Header from "../components/ui/navbar";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import logo_light from '../assets/logo_lightMode.png';
import logo_dark from '../assets/logo_darkMode.png';

const MyGaragesPage = ({ isLoggedIn, userData, handleLogout }) => {
  const { darkMode, themeLoaded } = useTheme();
  const { handleCartLogout } = useCart();
  const navigate = useNavigate();
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddGarageForm, setShowAddGarageForm] = useState(false);
  const [newGarage, setNewGarage] = useState({
    name: "",
    location: "",
    description: "",
    contact_info: "",
    opening_hours: ""
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Add this useEffect after your existing useEffect
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []); // Empty dependency array means it only runs once when component mounts

  useEffect(() => {
    if (!userData || userData.role !== "garage_owner") {
      navigate("/");
      return;
    }

    fetchGarages();
  }, [userData, navigate]);

  const fetchGarages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Log user data for debugging
      console.log("Current user data:", userData);

      const response = await axios.get('http://localhost:3000/garages', {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });

      console.log("Garages response:", response.data);

      // Try to find the user ID from different possible properties
      const userId = userData?.userId || userData?.id;
      console.log("Using userId:", userId);

      // Filter garages to only show those owned by the current user
      if (Array.isArray(response.data)) {
        const userGarages = response.data.filter(garage => {
          if (!garage.owner_id || !userId) return false;
          return garage.owner_id.toString() === userId.toString();
        });

        console.log("Filtered garages:", userGarages);
        setGarages(userGarages);
      } else if (response.data && typeof response.data === 'object' && Array.isArray(response.data.data)) {
        const userGarages = response.data.data.filter(garage => {
          if (!garage.owner_id || !userId) return false;
          return garage.owner_id.toString() === userId.toString();
        });
        setGarages(userGarages);
      } else {
        console.error("Unexpected response format:", response.data);
        setGarages([]);
        setError("Váratlan válasz formátum a szervertől.");
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching garages:", err);
      setError("Hiba történt a garázsok betöltése közben: " + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGarage({
      ...newGarage,
      [name]: value
    });
  };

  const handleLogoutWithCartClear = () => {
    handleCartLogout();
    handleLogout();
  };

  const handleAddGarage = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const userId = userData?.userId || userData?.id;

      if (!userId) {
        setError("Felhasználói azonosító hiányzik. Kérjük, jelentkezzen be újra.");
        return;
      }

      await axios.post(
        'http://localhost:3000/garages',
        {
          ...newGarage,
          owner_id: userId,
          contact_info: newGarage.contact_info || newGarage.contact_phone
        },
        {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` })
          }
        }
      );

      setNewGarage({
        name: "",
        location: "",
        description: "",
        contact_info: "",
        opening_hours: ""
      });
      setShowAddGarageForm(false);
      fetchGarages();
    } catch (err) {
      setError("Hiba történt a garázs hozzáadása közben: " + (err.response?.data?.message || err.message));
      console.error(err);
    }
  };

  const navigateToInventory = (garageId) => {
    navigate(`/my-garages/${garageId}/inventory`);
  };

  // Don't render until theme is loaded
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

      <section className="max-w-7xl mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Garázsaim</h1>
            <Button onClick={() => setShowAddGarageForm(!showAddGarageForm)}>
              {showAddGarageForm ? "Mégse" : "Új garázs hozzáadása"}
            </Button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
            >
              {error}
            </motion.div>
          )}

          {showAddGarageForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`mb-8 p-6 rounded-xl ${darkMode ? "bg-[#1e2129]" : "bg-white"} shadow-lg`}
            >
              <h2 className="text-xl font-semibold mb-4">Új garázs hozzáadása</h2>
              <form onSubmit={handleAddGarage}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Név</label>
                    <input
                      type="text"
                      name="name"
                      value={newGarage.name}
                      onChange={handleInputChange}
                      className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Helyszín</label>
                    <input
                      type="text"
                      name="location"
                      value={newGarage.location}
                      onChange={handleInputChange}
                      className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Telefonszám</label>
                    <input
                      type="text"
                      name="contact_phone"
                      value={newGarage.contact_phone}
                      onChange={handleInputChange}
                      className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Nyitvatartás</label>
                    <input
                      type="text"
                      name="opening_hours"
                      value={newGarage.opening_hours}
                      onChange={handleInputChange}
                      className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                      placeholder="pl. H-P: 8:00-17:00, Szo: 9:00-13:00"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-medium">Leírás</label>
                    <textarea
                      name="description"
                      value={newGarage.description}
                      onChange={handleInputChange}
                      className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                      rows="4"
                      placeholder="Írja le a garázs szolgáltatásait, specialitásait..."
                    ></textarea>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button type="submit">
                    Garázs mentése
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4e77f4]"></div>
            </div>
          ) : garages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className={`p-12 text-center rounded-xl ${darkMode ? "bg-[#1e2129]" : "bg-white"} shadow-lg`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-[#88a0e8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-xl text-[#88a0e8]">Még nincs garázsod.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {garages.map((garage, index) => (
                <motion.div
                  key={garage.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? "bg-[#1e2129]" : "bg-white"} hover:shadow-xl transition-shadow`}
                >
                  <div className="h-3 bg-[#4e77f4]"></div>
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-2">{garage.name}</h2>
                    <p className="text-sm text-[#88a0e8] mb-3">{garage.location}</p>

                    <div className="mb-4">
                      {garage.contact_info && (
                        <div className="flex items-center text-sm mb-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#88a0e8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {garage.contact_info}
                        </div>
                      )}
                      {garage.opening_hours && (
                        <div className="flex items-center text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#88a0e8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {garage.opening_hours}
                        </div>
                      )}
                    </div>

                    <p className="mb-6 text-sm line-clamp-3">{garage.description || "Nincs leírás"}</p>

                    <div className="flex justify-between">
                      <Button onClick={() => navigateToInventory(garage.id)}>
                        Készlet kezelése
                      </Button>
                      <Button onClick={() => navigate(`/my-garages/${garage.id}/edit`)}>
                        Szerkesztés
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </section>

      <footer className={`py-6 mt-12 ${darkMode ? "bg-[#070708] text-[#f9fafc]" : "bg-[#f9fafc] text-black"} text-center`}>
        <p className="text-sm">&copy; 2025 Gumizz Kft. Minden jog fenntartva.</p>
        <div className="mt-2">
          <a href="#" className="text-sm text-[#4e77f4] hover:text-[#5570c2]">Adatvédelem</a> |
          <a href="#" className="text-sm text-[#4e77f4] hover:text-[#5570c2]"> Általános Szerződési Feltételek</a>
        </div>
      </footer>
    </div>
  );
};

export default MyGaragesPage;