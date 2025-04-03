import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import Header from "../components/ui/navbar";
import { motion } from "framer-motion";
import logo_light from '../assets/logo_lightMode.png';
import logo_dark from '../assets/logo_darkMode.png';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import CartSidebar from '../components/ui/CartSidebar';

export default function TyreShopHomepage({
  setIsLoginOpen,
  setIsRegisterOpen,
  isLoggedIn,
  userData,
  handleLogout
}) {
  const { darkMode, themeLoaded } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { handleCartLogout, addToCart, cartItems } = useCart();
  const [garages, setGarages] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch products
        const productsResponse = await axios.get('http://localhost:3000/inventory');

        // Fetch garages for displaying garage names
        const garagesResponse = await axios.get('http://localhost:3000/garages');
        setGarages(garagesResponse.data);

        if (productsResponse.data.length > 0) {
          const shuffled = [...productsResponse.data].sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, 3);
          setFeaturedProducts(selected);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    return `http://localhost:3000${imagePath}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('hu-HU').format(price);
  };

  // Get vehicle type display name
  const getVehicleTypeDisplayName = (type) => {
    switch (type) {
      case 'car': return 'Személygépkocsi';
      case 'motorcycle': return 'Motorkerékpár';
      case 'truck': return 'Teherautó';
      default: return 'Ismeretlen';
    }
  };

  const handleShopNavigation = () => {
    navigate('/shop');
  };

  const handleProductNavigation = (productId) => {
    navigate(`/item/${productId}`);
  };

  // Handle adding item to cart
  const handleAddToCart = async (e, item) => {
    e.stopPropagation(); // Prevent navigation to product page

    if (!isLoggedIn) {
      // Prompt user to login
      setIsLoginOpen(true);
      return;
    }

    // Try to add to cart
    const success = await addToCart('inventory', item.id, 1);

    // Only open cart if successfully added
    if (success) {
      setIsCartOpen(true);
    }
  };

  const handleLoginSuccess = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    setIsLoginOpen(false);
  };

  const handleLogoutWithCartClear = () => {
    handleCartLogout();
    handleLogout();
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
        setIsLoginOpen={setIsLoginOpen}
        setIsRegisterOpen={setIsRegisterOpen}
        isLoggedIn={isLoggedIn}
        userData={userData}
        handleLogout={handleLogoutWithCartClear}
        onCartClick={() => setIsCartOpen(true)}
        cartItemsCount={cartItems.length}
      />
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
      />
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
          {/* Changed to onClick handler instead of Link for better animation control */}
          <Button
            className="mt-6 bg-[#4e77f4] hover:bg-[#5570c2] text-white px-6 py-3 rounded-2xl text-lg shadow-lg"
            onClick={handleShopNavigation}
          >
            Tovább a webshopra
          </Button>
        </motion.div>
      </section>

      <section className="py-16 px-5">
        <h2 className="text-3xl font-semibold text-center mb-8">Kiemelt ajánlatok</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {loading ? (
            // Loading placeholders
            [1, 2, 3].map((_, index) => (
              <motion.div
                key={index}
                className={`rounded-lg shadow-lg overflow-hidden ${darkMode ? "bg-[#252830]" : "bg-white"}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="h-48 bg-gray-700 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-5 bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2 mb-4 animate-pulse"></div>
                  <div className="h-6 bg-gray-700 rounded w-1/3 mb-4 animate-pulse"></div>
                  <div className="h-10 bg-gray-700 rounded w-full animate-pulse"></div>
                </div>
              </motion.div>
            ))
          ) : featuredProducts.length > 0 ? (
            // Display featured products - updated to match shop.jsx format
            featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                onClick={() => handleProductNavigation(product.id)}
                className={`rounded-lg shadow-md overflow-hidden ${darkMode ? "bg-[#252830]" : "bg-white"} hover:shadow-lg transition-shadow cursor-pointer`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="h-48 bg-white relative overflow-hidden">
                  {product.cover_img ? (
                    <img
                      src={getImageUrl(product.cover_img)}
                      alt={product.item_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = "https://placehold.co/400x300/gray/white?text=No+Image"
                      }}
                    />
                  ) : (
                    <div className="text-center p-4 h-full flex flex-col items-center justify-center">
                      <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-2 text-gray-500 dark:text-gray-400">Nincs kép</p>
                    </div>
                  )}
                  {/* Vehicle type badge */}
                  <div className="absolute top-2 right-2 bg-[#4e77f4] text-white text-xs px-2 py-1 rounded-full">
                    {getVehicleTypeDisplayName(product.vehicle_type)}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-1">{product.item_name}</h3>
                  <p className="text-[#88a0e8] text-sm mb-2">
                    {garages.find(g => g.id === product.garage_id)?.name || 'Ismeretlen szervíz'}
                  </p>
                  <p className="text-xl font-bold mb-3">{formatPrice(product.unit_price)} Ft</p>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${product.quantity > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {product.quantity > 0 ? `Készleten: ${product.quantity} db` : 'Nincs készleten'}
                    </span>
                    <Button
                      className="bg-[#4e77f4] hover:bg-[#5570c2] text-white px-3 py-2 rounded-lg"
                      disabled={product.quantity <= 0}
                      onClick={(e) => handleAddToCart(e, product)}
                    >
                      Kosárba
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            // Fallback if no products are available
            [1, 2, 3].map((_, index) => (
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
                <Button
                  className="mt-4 bg-[#4e77f4] hover:bg-[#5570c2] text-white px-4 py-2 rounded-xl"
                  onClick={handleShopNavigation}
                >
                  Tovább a webshopra
                </Button>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Rest of the component remains unchanged */}
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

      <footer className={`py-6 ${darkMode ? "bg-[#070708] text-[#f9fafc]" : "bg-[#f9fafc] text-black"} text-center`}>
        <p className="text-sm">© 2025 Gumizz Kft. Minden jog fenntartva.</p>
        <div className="mt-2">
          <a href="#" className="text-sm text-[#4e77f4] hover:text-[#5570c2]">Adatvédelem</a> |
          <a href="#" className="text-sm text-[#4e77f4] hover:text-[#5570c2]"> Általános Szerződési Feltételek</a>
        </div>
      </footer>
    </div>
  );
}