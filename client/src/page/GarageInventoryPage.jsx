import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import { useCart } from '../context/CartContext';
import Header from "../components/ui/navbar";
import { Button } from "../components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import logo_light from '../assets/logo_lightMode.png';
import logo_dark from '../assets/logo_darkMode.png';
import Footer from "../components/ui/Footer";

const GarageInventoryPage = ({ isLoggedIn, userData, handleLogout }) => {
  const { garageId } = useParams();
  const { darkMode, themeLoaded } = useTheme();
  const { handleCartLogout } = useCart();
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
    description: "",
    season: "",
    width: "",
    profile: "",
    diameter: ""
  });

  const [coverImage, setCoverImage] = useState(null);
  const [additionalImage1, setAdditionalImage1] = useState(null);
  const [additionalImage2, setAdditionalImage2] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [currentDragTarget, setCurrentDragTarget] = useState(null);

  useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: 'smooth' });

      const timer = setTimeout(() => {
        setError(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    return `http://localhost:3000${imagePath}`;
  };

  const handleDragEnter = (e, target) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setCurrentDragTarget(target);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const relatedTarget = e.relatedTarget;
    if (relatedTarget && e.currentTarget.contains(relatedTarget)) {
      return;
    }

    setIsDragging(false);
    setCurrentDragTarget(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e, target) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);
    setCurrentDragTarget(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.match('image.*')) {
        if (target === 'cover_img') {
          setCoverImage(file);
        } else if (target === 'additional_img1') {
          setAdditionalImage1(file);
        } else if (target === 'additional_img2') {
          setAdditionalImage2(file);
        }
      }
    }
  };

  const handleLogoutWithCartClear = () => {
    handleCartLogout();
    handleLogout();
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [garageId]);

  useEffect(() => {
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

      const garageResponse = await axios.get(`http://localhost:3000/garages/${garageId}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });

      const garageData = garageResponse.data && typeof garageResponse.data === 'object' && 'data' in garageResponse.data
        ? garageResponse.data.data
        : garageResponse.data;

      setGarage(garageData);

      if (userData && userData.userId) {

        if (!(garageData.owner_id === userData.userId ||
          garageData.owner_id === parseInt(userData.userId) ||
          garageData.owner_id.toString() === userData.userId.toString())) {
          navigate("/my-garages");
          return;
        }
      }

      const inventoryResponse = await axios.get(`http://localhost:3000/inventory?garage_id=${garageId}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });

      const inventoryData = Array.isArray(inventoryResponse.data)
        ? inventoryResponse.data.filter(item => item.garage_id === parseInt(garageId, 10))
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
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      if (name === 'cover_img') {
        setCoverImage(files[0]);
      } else if (name === 'additional_img1') {
        setAdditionalImage1(files[0]);
      } else if (name === 'additional_img2') {
        setAdditionalImage2(files[0]);
      }
    } else {
      setNewItem({
        ...newItem,
        [name]: value
      });
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();

    if (parseFloat(newItem.unit_price) <= 0) {
      setError("Az egységár nagyobb kell legyen, mint 0 Ft!");
      return;
    }

    if (!newItem.season) {
      setError("Kérjük válasszon évszakot!");
      return;
    }

    if (!coverImage) {
      setError("A borítókép feltöltése kötelező!");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append('garage_id', parseInt(garageId));
      formData.append('item_name', newItem.item_name);
      formData.append('vehicle_type', newItem.vehicle_type);
      formData.append('quantity', newItem.quantity);
      formData.append('unit_price', newItem.unit_price);
      formData.append('description', newItem.description);

      if (newItem.season) formData.append('season', newItem.season);
      if (newItem.width) formData.append('width', newItem.width);
      if (newItem.profile) formData.append('profile', newItem.profile);
      if (newItem.diameter) formData.append('diameter', newItem.diameter);

      if (coverImage) {
        formData.append('cover_img', coverImage);
      }
      if (additionalImage1) {
        formData.append('additional_img1', additionalImage1);
      }
      if (additionalImage2) {
        formData.append('additional_img2', additionalImage2);
      }

      await axios.post(
        'http://localhost:3000/inventory',
        formData,
        {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setNewItem({
        item_name: "",
        vehicle_type: "car",
        quantity: 0,
        unit_price: "",
        description: "",
        season: "",
        width: "",
        profile: "",
        diameter: ""
      });
      setCoverImage(null);
      setAdditionalImage1(null);
      setAdditionalImage2(null);
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

        fetchGarageAndInventory();
      } catch (err) {
        setError("Hiba történt a termék törlése közben: " + (err.response?.data?.message || err.message));
        console.error(err);
      }
    }
  };

  const getVehicleTypeLabel = (type) => {
    switch (type) {
      case 'car': return 'Személygépkocsi';
      case 'motorcycle': return 'Motor';
      case 'truck': return 'Teherautó';
      default: return type;
    }
  };

  const getSeasonLabel = (season) => {
    switch (season) {
      case 'winter': return 'Téli';
      case 'summer': return 'Nyári';
      case 'all_season': return 'Négyévszakos';
      default: return 'Nincs megadva';
    }
  };

  const renderImageUpload = (imageType, image, setImage, label) => {
    return (
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium" dangerouslySetInnerHTML={{ __html: label }}></label>
        <div
          className={`border-2 border-dashed rounded-lg p-4 transition-all 
          ${isDragging && currentDragTarget === imageType ? "border-[#4e77f4] bg-blue-50" : ""} 
          ${darkMode
              ? `${isDragging && currentDragTarget === imageType ? "bg-[#1e2129] border-[#4e77f4]" : "border-[#3a3f4b] bg-[#252830]"}`
              : `${isDragging && currentDragTarget === imageType ? "bg-blue-50 border-[#4e77f4]" : "border-gray-300 bg-gray-50"}`} 
          hover:border-[#4e77f4]`}
          onDragEnter={(e) => handleDragEnter(e, imageType)}
          onDragOver={(e) => handleDragOver(e)}
          onDragLeave={(e) => handleDragLeave(e)}
          onDrop={(e) => handleDrop(e, imageType)}
        >
          <div className="flex flex-col items-center justify-center">
            {image ? (
              <div className="w-full">
                <div className="flex items-center justify-center mb-4">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Preview"
                    className="h-40 object-contain rounded-md"
                  />
                </div>
                <p className="text-sm text-center mb-2 text-green-500">
                  <span className="font-medium">{image.name}</span> ({(image.size / 1024).toFixed(1)} KB)
                </p>
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                  >
                    Kép eltávolítása
                  </button>
                </div>
              </div>
            ) : (
              <>
                <svg
                  className={`w-10 h-10 mb-3 ${isDragging && currentDragTarget === imageType ? "text-[#4e77f4]" : darkMode ? "text-gray-400" : "text-gray-500"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  ></path>
                </svg>
                <p className={`mb-2 text-sm ${isDragging && currentDragTarget === imageType ? "text-[#4e77f4] font-medium" : darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {isDragging && currentDragTarget === imageType
                    ? <span className="font-semibold">Engedd el a fájlt a feltöltéshez</span>
                    : <span><span className="font-semibold">Kattints a feltöltéshez</span> vagy húzd ide a fájlt</span>
                  }
                </p>
                <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                  PNG, JPG vagy WEBP (Max. 5MB)
                </p>
              </>
            )}
            <input
              type="file"
              name={imageType}
              id={`file-upload-${imageType}`}
              className="hidden"
              onChange={handleInputChange}
              accept="image/*"
            />
            {!image && (
              <label
                htmlFor={`file-upload-${imageType}`}
                className="mt-4 px-4 py-2 bg-[#4e77f4] text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-[#5570c2] transition-colors"
              >
                Kép kiválasztása
              </label>
            )}
          </div>
        </div>
      </div>
    );
  };

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
                  className="text-[#88a0e8] mb-2 flex items-center font-medium cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Vissza a garázsokhoz
                </motion.button>
                <h1 className="text-3xl font-bold">{garage.name} - Készlet</h1>
              </div>
              <Button onClick={() => setShowAddItemForm(!showAddItemForm)}>
                {showAddItemForm ? "Mégse" : "Új termék hozzáadása"}
              </Button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex justify-between items-center"
                >
                  <div>{error}</div>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-700 hover:text-red-900"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

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
                      <label className="block mb-2 text-sm font-medium">
                        Termék neve <span className="text-red-500">*</span>
                      </label>
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
                      <label className="block mb-2 text-sm font-medium">
                        Jármű típus <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="vehicle_type"
                        value={newItem.vehicle_type}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                        required
                      >
                        <option value="car">Személygépkocsi</option>
                        <option value="motorcycle">Motor</option>
                        <option value="truck">Teherautó</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Mennyiség <span className="text-red-500">*</span>
                      </label>
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
                      <label className="block mb-2 text-sm font-medium">
                        Egységár (Ft) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="unit_price"
                        value={newItem.unit_price}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all ${parseFloat(newItem.unit_price) <= 0 && "border-red-500"}`}
                        min="1"
                        step="0.01"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Évszak <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="season"
                        value={newItem.season}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all ${!newItem.season && "border-red-500"}`}
                        required
                      >
                        <option value="">Válassz évszakot</option>
                        <option value="winter">Téli</option>
                        <option value="summer">Nyári</option>
                        <option value="all_season">Négyévszakos</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Szélesség (mm) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="width"
                        value={newItem.width}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Profil (%) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="profile"
                        value={newItem.profile}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Átmérő (col) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="diameter"
                        value={newItem.diameter}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                        min="0"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block mb-2 text-sm font-medium">Termék leírása</label>
                      <textarea
                        name="description"
                        value={newItem.description}
                        onChange={handleInputChange}
                        rows="4"
                        className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                        placeholder="Adjon meg részletes leírást a termékről..."
                      ></textarea>
                    </div>

                    <div className="md:col-span-2">
                      {renderImageUpload('cover_img', coverImage, setCoverImage, 'Borítókép <span class="text-red-500">*</span>')}
                    </div>

                    <div className="md:col-span-1">
                      {renderImageUpload('additional_img1', additionalImage1, setAdditionalImage1, 'További kép 1')}
                    </div>

                    <div className="md:col-span-1">
                      {renderImageUpload('additional_img2', additionalImage2, setAdditionalImage2, 'További kép 2')}
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button type="submit">
                      Termék mentése
                    </Button>
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
                <p className="text-xl text-[#88a0e8]">Még nincs termék a készletben.</p>
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
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[#88a0e8]">
                          Évszak
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[#88a0e8]">
                          Méret
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
                                    src={getImageUrl(item.cover_img)}
                                    alt={item.item_name}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "https://placehold.co/40x40/gray/white?text=No+Image";
                                    }}
                                  />
                                </div>
                              )}
                              <div>
                                <div className="font-medium">{item.item_name}</div>
                                {item.additional_img1 || item.additional_img2 ? (
                                  <div className="text-xs text-gray-500">
                                    {item.additional_img1 && item.additional_img2 ?
                                      '2 további kép' : '1 további kép'}
                                  </div>
                                ) : null}
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.season ? (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.season === 'winter'
                                ? 'bg-blue-100 text-blue-800'
                                : item.season === 'summer'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                                }`}>
                                {getSeasonLabel(item.season)}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.width && item.profile && item.diameter ? (
                              <span className="text-sm">
                                {item.width}/{item.profile}R{item.diameter}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => navigate(`/my-garages/${garageId}/inventory/${item.id}/edit`)}
                              className="text-[#4e77f4] hover:text-[#5570c2] font-medium mr-4 cursor-pointer"
                            >
                              Szerkesztés
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-500 hover:text-red-700 font-medium cursor-pointer"
                            >
                              Törlés
                            </button>
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
      <Footer />
    </div>
  );
};

export default GarageInventoryPage;