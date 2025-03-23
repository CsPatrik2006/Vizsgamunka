import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import Header from "../components/ui/navbar";
import { motion } from "framer-motion";
import logo_light from '../assets/logo_lightMode.png';
import logo_dark from '../assets/logo_darkMode.png';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import CartSidebar from '../components/ui/CartSidebar';
import axios from 'axios';

export default function ShopPage({
  setIsLoginOpen,
  setIsRegisterOpen,
  isLoggedIn,
  userData,
  handleLogout
}) {
  const navigate = useNavigate();
  const { darkMode, themeLoaded } = useTheme();
  const { addToCart, cartItems, initializeCart } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [garages, setGarages] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGarage, setSelectedGarage] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Initialize cart when user logs in
  useEffect(() => {
    if (isLoggedIn && userData) {
      // Use the first garage as default if none selected
      const defaultGarageId = selectedGarage || (garages.length > 0 ? garages[0].id : 1);
      initializeCart(userData.id, defaultGarageId);
    }
  }, [isLoggedIn, userData, garages, selectedGarage]);

  // Handle adding item to cart
  const handleAddToCart = (item) => {
    if (!isLoggedIn) {
      // Prompt user to login
      setIsLoginOpen(true);
      return;
    }

    addToCart('inventory', item.id, 1);
    setIsCartOpen(true); // Open cart sidebar when item is added
  };

  // Add the getImageUrl helper function here
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
  
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
  
    return `http://localhost:3000${imagePath}`;
  };

  // Fetch garages and inventory items
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch garages
        const garagesResponse = await axios.get('http://localhost:3000/garages');
        setGarages(garagesResponse.data);
      
        // Fetch inventory items
        const inventoryResponse = await axios.get('http://localhost:3000/inventory');
        setInventoryItems(inventoryResponse.data);
        setFilteredItems(inventoryResponse.data); // Initially show all items
      
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);
// Filter inventory items by garage
const filterByGarage = (garageId) => {
  setSelectedGarage(garageId);
  if (garageId === null) {
    setFilteredItems(inventoryItems); // Show all items
  } else {
    const filtered = inventoryItems.filter(item => item.garage_id === garageId);
    setFilteredItems(filtered);
  }
};

// Format price with thousand separator
const formatPrice = (price) => {
  return new Intl.NumberFormat('hu-HU').format(price);
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
      setIsLoginOpen={setIsLoginOpen}
      setIsRegisterOpen={setIsRegisterOpen}
      isLoggedIn={isLoggedIn}
      userData={userData}
      handleLogout={handleLogout}
      onCartClick={() => setIsCartOpen(true)}
      cartItemsCount={cartItems.length}
    />

    {/* Cart Sidebar */}
    <CartSidebar 
      isOpen={isCartOpen} 
      onClose={() => setIsCartOpen(false)} 
      cartItems={cartItems} 
    />

    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Gumiszervíz Webshop</h1>
      
      {/* Garage filter section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Szervízek</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => filterByGarage(null)}
            className={`px-4 py-2 rounded-lg ${selectedGarage === null 
              ? 'bg-[#4e77f4] text-white' 
              : darkMode ? 'bg-[#252830] text-white' : 'bg-gray-200 text-black'}`}
          >
            Összes
          </Button>
          {garages.map(garage => (
            <Button
              key={garage.id}
              onClick={() => filterByGarage(garage.id)}
              className={`px-4 py-2 rounded-lg ${selectedGarage === garage.id 
                ? 'bg-[#4e77f4] text-white' 
                : darkMode ? 'bg-[#252830] text-white' : 'bg-gray-200 text-black'}`}
            >
              {garage.name}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Inventory items grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          // Loading placeholders
          Array(8).fill().map((_, index) => (
            <div 
              key={index}
              className={`rounded-lg shadow-md overflow-hidden ${darkMode ? "bg-[#252830]" : "bg-white"}`}
            >
              <div className="h-48 bg-gray-700 animate-pulse"></div>
              <div className="p-4">
                <div className="h-5 bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-4 animate-pulse"></div>
                <div className="h-6 bg-gray-700 rounded w-1/3 mb-4 animate-pulse"></div>
                <div className="h-10 bg-gray-700 rounded w-full animate-pulse"></div>
              </div>
            </div>
          ))
        ) : filteredItems.length > 0 ? (
          // Display inventory items
          filteredItems.map(item => (
            <motion.div
              onClick={() => navigate(`/item/${item.id}`)}
              key={item.id}
              className={`rounded-lg shadow-md overflow-hidden ${darkMode ? "bg-[#252830]" : "bg-white"} hover:shadow-lg transition-shadow cursor-pointer`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="h-48 bg-gray-700 relative overflow-hidden">
                {item.cover_img ? (
                  <img 
                    src={getImageUrl(item.cover_img)} 
                    alt={item.item_name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = "https://placehold.co/400x300/gray/white?text=No+Image"
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    No Image
                  </div>
                )}
                {/* Vehicle type badge */}
                <div className="absolute top-2 right-2 bg-[#4e77f4] text-white text-xs px-2 py-1 rounded-full">
                {item.vehicle_type === 'car' ? 'Személygépkocsi' : 
                   item.vehicle_type === 'motorcycle' ? 'Motorkerékpár' : 'Teherautó'}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-1">{item.item_name}</h3>
                <p className="text-[#88a0e8] text-sm mb-2">
                  {garages.find(g => g.id === item.garage_id)?.name || 'Ismeretlen szervíz'}
                </p>
                <p className="text-xl font-bold mb-3">{formatPrice(item.unit_price)} Ft</p>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${item.quantity > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {item.quantity > 0 ? `Készleten: ${item.quantity} db` : 'Nincs készleten'}
                  </span>
                  <Button 
                    className="bg-[#4e77f4] hover:bg-[#5570c2] text-white px-3 py-2 rounded-lg"
                    disabled={item.quantity <= 0}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent event bubbling
                      handleAddToCart(item);
                    }}
                  >
                    Kosárba
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          // No items found
          <div className="col-span-full text-center py-12">
            <p className="text-xl text-[#88a0e8]">
              {selectedGarage ? 'Nincs termék a kiválasztott szervízben.' : 'Nem található termék.'}
            </p>
          </div>
        )}
      </div>
    </div>

    <footer className={`py-6 mt-12 ${darkMode ? "bg-[#070708] text-[#f9fafc]" : "bg-[#f9fafc] text-black"} text-center`}>
      <p className="text-sm">© 2025 Gumizz Kft. Minden jog fenntartva.</p>
      <div className="mt-2">
        <a href="#" className="text-sm text-[#4e77f4] hover:text-[#5570c2]">Adatvédelem</a> |
        <a href="#" className="text-sm text-[#4e77f4] hover:text-[#5570c2]"> Általános Szerződési Feltételek</a>
      </div>
    </footer>
  </div>
);
}