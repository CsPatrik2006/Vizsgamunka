import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import Header from "../components/ui/navbar";
import { motion } from "framer-motion";
import logo_light from '../assets/logo_lightMode.png';
import logo_dark from '../assets/logo_darkMode.png';

const GarageInventoryPage = ({ isLoggedIn, userData, handleLogout }) => {
  const { garageId } = useParams();
  const { darkMode, themeLoaded } = useTheme();
  const navigate = useNavigate();
  const [garage, setGarage] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [newItem, setNewItem] = useState({
    item_name: "",
    vehicle_type: "car",
    quantity: 0,
    unit_price: "",
    cover_img: ""
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Check if user is logged in and is a garage owner
    if (!userData || userData.role !== "garage_owner") {
      navigate("/");
      return;
    }

    fetchGarageAndInventory();
  }, [garageId, userData, navigate]);

  const fetchGarageAndInventory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Log user data for debugging
      console.log("Current user data:", userData);

      // Fetch garage details
      const garageResponse = await axios.get(`http://localhost:3000/garages/${garageId}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });

      console.log("Garage response:", garageResponse.data);

      // Handle different response formats
      const garageData = garageResponse.data && typeof garageResponse.data === 'object' && 'data' in garageResponse.data
        ? garageResponse.data.data
        : garageResponse.data;

      setGarage(garageData);

      // Only check owner_id if userData exists and has userId
      if (userData && userData.userId) {
        console.log(`Garage ${garageData.id} (${garageData.name}) - owner_id: ${garageData.owner_id} (${typeof garageData.owner_id}), comparing with userId: ${userData.userId} (${typeof userData.userId})`);

        if (!(garageData.owner_id === userData.userId ||
          garageData.owner_id === parseInt(userData.userId) ||
          garageData.owner_id.toString() === userData.userId.toString())) {
          navigate("/my-garages");
          return;
        }
      }

      // Fetch inventory items for this garage
      const inventoryResponse = await axios.get(`http://localhost:3000/inventory?garage_id=${garageId}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });

      console.log("Inventory response:", inventoryResponse.data);

      // Handle different response formats for inventory
      const inventoryData = inventoryResponse.data && typeof inventoryResponse.data === 'object' && 'data' in inventoryResponse.data
        ? inventoryResponse.data.data
        : Array.isArray(inventoryResponse.data)
          ? inventoryResponse.data
          : [];

      setInventory(inventoryData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Hiba történt az adatok betöltése közben: " + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({
      ...newItem,
      [name]: name === "unit_price" || name === "quantity" ? parseFloat(value) : value
    });
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        'http://localhost:3000/inventory',
        {
          ...newItem,
          garage_id: parseInt(garageId)
        },
        {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` })
          }
        }
      );

      // Reset form and fetch updated inventory
      setNewItem({
        item_name: "",
        vehicle_type: "car",
        quantity: 0,
        unit_price: "",
        cover_img: ""
      });
      setShowAddItemForm(false);
      fetchGarageAndInventory();
    } catch (err) {
      setError("Hiba történt a termék hozzáadása közben: " + (err.response?.data?.message || err.message));
      console.error(err);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm("Biztosan törölni szeretnéd ezt a terméket?")) {
      try {
        const token = localStorage.getItem("token");

        await axios.delete(
          `http://localhost:3000/inventory/${itemId}`,
          {
            headers: {
              ...(token && { Authorization: `Bearer ${token}` })
            }
          }
        );

        // Refresh inventory list
        fetchGarageAndInventory();
      } catch (err) {
        setError("Hiba történt a termék törlése közben: " + (err.response?.data?.message || err.message));
        console.error(err);
      }
    }
  };

  const getVehicleTypeLabel = (type) => {
    switch (type) {
      case 'car': return 'Autó';
      case 'motorcycle': return 'Motor';
      case 'truck': return 'Teherautó';
      default: return type;
    }
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
        handleLogout={handleLogout}
      />

      <section className="max-w-7xl mx-auto py-12 px-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4e77f4]"></div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/my-garages")}
                  className="text-[#4e77f4] hover:text-[#5570c2] mb-2 flex items-center font-medium cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Vissza a garázsokhoz
                </motion.button>
                <h1 className="text-3xl font-bold">{garage.name} - Készlet</h1>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddItemForm(!showAddItemForm)}
                className="bg-[#4e77f4] hover:bg-[#5570c2] text-white px-4 py-2 rounded-lg font-medium cursor-pointer"
              >
                {showAddItemForm ? "Mégse" : "Új termék hozzáadása"}
              </motion.button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6"
              >
                {error}
              </motion.div>
            )}

            {showAddItemForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className={`mb-8 p-6 rounded-xl ${darkMode ? "bg-[#1e2129]" : "bg-white"} shadow-lg`}
              >
                <h2 className="text-xl font-semibold mb-4">Új termék hozzáadása</h2>
                <form onSubmit={handleAddItem}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block mb-2 text-sm font-medium">Termék neve</label>
                      <input
                        type="text"
                        name="item_name"
                        value={newItem.item_name}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium">Jármű típus</label>
                      <select
                        name="vehicle_type"
                        value={newItem.vehicle_type}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                        required
                      >
                        <option value="car">Autó</option>
                        <option value="motorcycle">Motor</option>
                        <option value="truck">Teherautó</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium">Mennyiség</label>
                      <input
                        type="number"
                        name="quantity"
                        value={newItem.quantity}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium">Egységár (Ft)</label>
                      <input
                        type="number"
                        name="unit_price"
                        value={newItem.unit_price}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block mb-2 text-sm font-medium">Kép URL</label>
                      <input
                        type="text"
                        name="cover_img"
                        value={newItem.cover_img}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="bg-[#4e77f4] hover:bg-[#5570c2] text-white px-6 py-3 rounded-lg font-medium cursor-pointer"
                    >
                      Termék mentése
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}

            {inventory.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className={`p-12 text-center rounded-xl ${darkMode ? "bg-[#1e2129]" : "bg-white"} shadow-lg`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-[#88a0e8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-xl mb-6 text-[#88a0e8]">Még nincs termék a készletben.</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddItemForm(true)}
                  className="bg-[#4e77f4] hover:bg-[#5570c2] text-white px-6 py-3 rounded-lg font-medium cursor-pointer"
                >
                  Új termék hozzáadása
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? "bg-[#1e2129]" : "bg-white"}`}
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className={darkMode ? "bg-[#252830]" : "bg-gray-50"}>
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[#88a0e8]">
                          Termék
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[#88a0e8]">
                          Jármű típus
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[#88a0e8]">
                          Mennyiség
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[#88a0e8]">
                          Egységár
                        </th>
                        <th scope="col" className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-[#88a0e8]">
                          Műveletek
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                      {inventory.map((item, index) => (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={darkMode ? "hover:bg-[#252830]" : "hover:bg-gray-50"}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {item.cover_img && (
                                <div className="flex-shrink-0 h-10 w-10 mr-4">
                                  <img
                                    className="h-10 w-10 rounded-full object-cover border-2 border-[#4e77f4]"
                                    src={item.cover_img}
                                    alt={item.item_name}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "https://via.placeholder.com/40?text=No+Image";
                                    }}
                                  />
                                </div>
                              )}
                              <div>
                                <div className="font-medium">{item.item_name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.vehicle_type === 'car'
                                ? 'bg-blue-100 text-blue-800'
                                : item.vehicle_type === 'motorcycle'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                              {getVehicleTypeLabel(item.vehicle_type)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`font-medium ${item.quantity > 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {item.quantity} db
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium">
                            {new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF' }).format(item.unit_price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => navigate(`/my-garages/${garageId}/inventory/${item.id}/edit`)}
                              className="text-[#4e77f4] hover:text-[#5570c2] font-medium mr-4"
                            >
                              Szerkesztés
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-500 hover:text-red-700 font-medium"
                            >
                              Törlés
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
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

export default GarageInventoryPage;