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
import ProductCard from '../components/ui/ProductCard';

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

  // Handle adding item to cart
  const handleAddToCart = async (e, item) => {
    e.stopPropagation(); // Prevent navigation to product page

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

  const handleProductNavigation = (productId) => {
    navigate(`/item/${productId}`);
  };

  const handleShopNavigation = () => {
    navigate('/shop');
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
          className="text-4xl font-bold max-w-5xl mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
        >
          Találd meg a járművedhez legjobban illő abroncsokat és foglalj időpontot a hozzád legközelebbi szervízhez.
        </motion.h1>

        <motion.div
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <Button
            className="mt-6 bg-[#4e77f4] hover:bg-[#5570c2] text-white px-12 py-6 rounded-2xl text-lg shadow-lg"
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
            // Display featured products using the ProductCard component
            featuredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                item={product}
                garage={garages.find(g => g.id === product.garage_id)}
                onAddToCart={handleAddToCart}
                onClick={() => handleProductNavigation(product.id)}
                isLoggedIn={isLoggedIn}
                setIsLoginOpen={setIsLoginOpen}
              />
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