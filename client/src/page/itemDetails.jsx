import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import Header from "../components/ui/navbar";
import { motion, AnimatePresence } from "framer-motion";
import logo_light from '../assets/logo_lightMode.png';
import logo_dark from '../assets/logo_darkMode.png';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import CartSidebar from '../components/ui/CartSidebar';
import axios from 'axios';
import Footer from "../components/ui/Footer";

export default function ItemDetailsPage({
  setIsLoginOpen,
  setIsRegisterOpen,
  isLoggedIn,
  userData,
  handleLogout
}) {
  const { darkMode, themeLoaded } = useTheme();
  const { addToCart, cartItems, initializeCart, handleCartLogout } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [item, setItem] = useState(null);
  const [garage, setGarage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { itemId } = useParams();
  const navigate = useNavigate();

  const handleLogoutWithCartClear = () => {
    handleCartLogout();
    handleLogout();
  };

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

  const getVehicleTypeDisplayName = (type) => {
    switch (type) {
      case 'car': return 'Személygépkocsi';
      case 'motorcycle': return 'Motorkerékpár';
      case 'truck': return 'Teherautó';
      default: return 'Ismeretlen';
    }
  };

  const getSeasonDisplayName = (season) => {
    switch (season) {
      case 'winter': return 'Téli';
      case 'summer': return 'Nyári';
      case 'all_season': return 'Négyévszakos';
      default: return 'Ismeretlen';
    }
  };

  const getItemImages = (item) => {
    if (!item) return [];

    const images = [];
    if (item.cover_img) images.push({ url: item.cover_img, type: 'cover' });
    if (item.additional_img1) images.push({ url: item.additional_img1, type: 'additional1' });
    if (item.additional_img2) images.push({ url: item.additional_img2, type: 'additional2' });

    return images;
  };

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      setIsLoginOpen(true);
      return;
    }

    if (item && quantity > 0) {
      addToCart(item.id, quantity);
      setIsCartOpen(true);
    } else {
      console.error('Invalid item or quantity');
    }
  };

  useEffect(() => {
    if (isLoggedIn && userData && item) {
      initializeCart(userData.id, item.garage_id);
    }
  }, [isLoggedIn, userData, item, initializeCart]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setCurrentImageIndex(0);
  }, [itemId]);

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        const itemResponse = await axios.get(`http://localhost:3000/inventory/${itemId}`);
        setItem(itemResponse.data);

        const garageResponse = await axios.get(`http://localhost:3000/garages/${itemResponse.data.garage_id}`);
        setGarage(garageResponse.data);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching item details:', error);
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [itemId]);

  useEffect(() => {
    setImageLoaded(false);
  }, [item, currentImageIndex]);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isZoomed) {
        setIsZoomed(false);
      }
    };

    window.addEventListener('keydown', handleEscKey);

    if (isZoomed) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = '';
    };
  }, [isZoomed]);

  if (!themeLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-800 text-white">
        <div className="text-xl">Betöltés...</div>
      </div>
    );
  }

  const itemImages = item ? getItemImages(item) : [];
  const currentImage = itemImages[currentImageIndex]?.url || null;

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
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="text-[#88a0e8] mb-6 flex items-center font-medium cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Vissza a termékekhez
        </motion.button>

        {loading ? (
          <div className={`rounded-lg shadow-md overflow-hidden ${darkMode ? "bg-[#252830]" : "bg-white"} p-6`}>
            <div className="flex flex-col md:flex-row gap-8 animate-pulse">
              <div className="w-full md:w-1/2 h-96 bg-gray-700 rounded-lg"></div>
              <div className="w-full md:w-1/2">
                <div className="h-8 bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-gray-700 rounded w-1/2 mb-6"></div>
                <div className="h-10 bg-gray-700 rounded w-1/3 mb-6"></div>
                <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-6"></div>
                <div className="h-12 bg-gray-700 rounded w-full mb-4"></div>
              </div>
            </div>
          </div>
        ) : item ? (
          <motion.div
            className={`rounded-lg shadow-md overflow-hidden ${darkMode ? "bg-[#252830]" : "bg-white"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/2 p-6">
                <div className="flex flex-col">
                  <div
                    className="h-80 flex items-center justify-center relative mb-4 overflow-hidden"
                    onClick={() => currentImage && setIsZoomed(true)}
                  >
                    {!imageLoaded && currentImage && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-[#4e77f4] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}

                    {currentImage ? (
                      <img
                        src={getImageUrl(currentImage)}
                        alt={item.item_name}
                        className={`w-full h-full object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${currentImage ? 'cursor-zoom-in' : ''}`}
                        onLoad={() => setImageLoaded(true)}
                        onError={(e) => {
                          setImageLoaded(true);
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/400x300/gray/white?text=No+Image";
                        }}
                      />
                    ) : (
                      <div className="text-center p-4">
                        <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">Nincs kép</p>
                      </div>
                    )}
                  </div>

                  {itemImages.length > 1 && (
                    <div className="flex justify-center space-x-2">
                      {itemImages.map((image, index) => (
                        <div
                          key={index}
                          className={`w-16 h-16 border-2 rounded-md overflow-hidden cursor-pointer transition-all ${currentImageIndex === index
                            ? `border-[#4e77f4] ${darkMode ? 'shadow-[0_0_10px_rgba(78,119,244,0.5)]' : 'shadow-[0_0_10px_rgba(78,119,244,0.3)]'}`
                            : darkMode ? 'border-gray-700' : 'border-gray-200'
                            }`}
                          onClick={() => setCurrentImageIndex(index)}
                        >
                          <img
                            src={getImageUrl(image.url)}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://placehold.co/64x64/gray/white?text=Error";
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {isZoomed && currentImage && (
                  <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30 dark:bg-black/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setIsZoomed(false)}
                  >
                    <motion.button
                      className={`absolute top-4 right-4 ${darkMode ? "bg-[#1e2129] text-[#f9fafc]" : "bg-white text-gray-700"} hover:bg-[#4e77f4] hover:text-white rounded-full p-3 shadow-md transition-colors duration-200 z-10 cursor-pointer`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsZoomed(false);
                      }}
                      aria-label="Bezárás"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>

                    {itemImages.length > 1 && (
                      <>
                        <motion.button
                          className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? "bg-[#1e2129] text-[#f9fafc]" : "bg-white text-gray-700"} hover:bg-[#4e77f4] hover:text-white rounded-full p-3 shadow-md transition-colors duration-200 z-10 cursor-pointer ${currentImageIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
                          whileHover={currentImageIndex > 0 ? { scale: 1.1 } : {}}
                          whileTap={currentImageIndex > 0 ? { scale: 0.9 } : {}}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (currentImageIndex > 0) {
                              setCurrentImageIndex(currentImageIndex - 1);
                            }
                          }}
                          disabled={currentImageIndex === 0}
                          aria-label="Előző kép"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </motion.button>

                        <motion.button
                          className={`absolute right-4 top-1/2 -translate-y-1/2 ${darkMode ? "bg-[#1e2129] text-[#f9fafc]" : "bg-white text-gray-700"} hover:bg-[#4e77f4] hover:text-white rounded-full p-3 shadow-md transition-colors duration-200 z-10 cursor-pointer ${currentImageIndex === itemImages.length - 1 ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
                          whileHover={currentImageIndex < itemImages.length - 1 ? { scale: 1.1 } : {}}
                          whileTap={currentImageIndex < itemImages.length - 1 ? { scale: 0.9 } : {}}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.2 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (currentImageIndex < itemImages.length - 1) {
                              setCurrentImageIndex(currentImageIndex + 1);
                            }
                          }}
                          disabled={currentImageIndex === itemImages.length - 1}
                          aria-label="Következő kép"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </motion.button>
                      </>
                    )}

                    <motion.div
                      className={`relative ${darkMode ? "bg-[#252830]/80" : "bg-white/80"} p-3 rounded-xl shadow-xl border ${darkMode ? "border-gray-700/30" : "border-gray-200/30"}`}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <motion.img
                        src={getImageUrl(currentImage)}
                        alt={item.item_name}
                        className="max-h-[85vh] max-w-[85vw] object-contain rounded-lg"
                        layoutId={`product-image-${item.id}-${currentImageIndex}`}
                      />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="w-full md:w-1/2 p-6">
                <div className="mb-2">
                  <span className="inline-block bg-[#4e77f4] text-white text-xs px-2 py-1 rounded-full mb-2">
                    {getVehicleTypeDisplayName(item.vehicle_type)}
                  </span>

                  {item.season && (
                    <span className={`inline-block ml-2 text-xs px-2 py-1 rounded-full ${item.season === 'winter'
                      ? 'bg-blue-500 text-white'
                      : item.season === 'summer'
                        ? 'bg-yellow-500 text-black'
                        : 'bg-green-500 text-white'
                      }`}>
                      {getSeasonDisplayName(item.season)}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl font-bold mb-2">{item.item_name}</h1>
                <p className="text-[#88a0e8] text-lg mb-4">
                  {garage?.name || 'Ismeretlen szervíz'}
                </p>

                {item.width && item.profile && item.diameter && (
                  <p className="text-lg mb-4 font-medium">
                    Méret: <span className="font-bold">{item.width}/{item.profile}R{item.diameter}</span>
                  </p>
                )}

                <p className="text-3xl font-bold mb-6">{formatPrice(item.unit_price)} Ft</p>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Termék leírása</h3>
                  <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                    {item.description || 'Nincs elérhető leírás ehhez a termékhez.'}
                  </p>
                </div>

                <div className="mb-6">
                  <p className={`text-lg ${item.quantity > 0 ? 'text-green-500' : 'text-red-500'} font-semibold`}>
                    {item.quantity > 0 ? `Készleten: ${item.quantity} db` : 'Nincs készleten'}
                  </p>
                </div>
                {item.quantity > 0 && (
                  <div className="flex flex-col gap-2 mb-6">
                    <label className="font-semibold">Mennyiség:</label>
                    <div className="flex items-center h-10">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className={`h-full px-4 flex items-center justify-center rounded-l-md ${darkMode ? "bg-[#1e2129] text-white hover:bg-[#2a2f3a]" : "bg-gray-200 text-black hover:bg-gray-300"} transition-colors duration-200 focus:outline-none cursor-pointer`}
                        aria-label="Csökkentés"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <input
                        type="text"
                        value={quantity}
                        onChange={(e) => {
                          const value = e.target.value === '' ? '' : parseInt(e.target.value);
                          if (value === '' || !isNaN(value)) {
                            setQuantity(value === '' ? '' : Math.min(item.quantity, Math.max(1, value)));
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === '' || isNaN(parseInt(e.target.value))) {
                            setQuantity(1);
                          }
                        }}
                        className={`h-full w-16 text-center border-0 ${darkMode ? "bg-[#252830] text-white border-x border-[#1e2129]" : "bg-white text-black border-x border-gray-200"} focus:outline-none focus:border-transparent appearance-none`}
                        aria-label="Mennyiség"
                      />
                      <button
                        onClick={() => setQuantity(Math.min(item.quantity, Number(quantity) + 1))}
                        className={`h-full px-4 flex items-center justify-center rounded-r-md ${darkMode ? "bg-[#1e2129] text-white hover:bg-[#2a2f3a]" : "bg-gray-200 text-black hover:bg-gray-300"} transition-colors duration-200 focus:outline-none cursor-pointer`}
                        aria-label="Növelés"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full bg-[#4e77f4] hover:bg-[#5570c2] text-white py-3 rounded-lg text-lg font-semibold"
                  disabled={item.quantity <= 0}
                  onClick={handleAddToCart}
                >
                  {item.quantity > 0 ? 'Kosárba' : 'Nincs készleten'}
                </Button>

                {garage && (<div className="mt-8 p-4 rounded-lg border border-gray-700">
                  <h3 className="text-lg font-semibold mb-2">Szervíz információ</h3>
                  <p className="mb-1"><span className="font-medium">Név:</span> {garage.name}</p>
                  <p className="mb-1"><span className="font-medium">Helyszín:</span> {garage.location}</p>
                  {garage.contact_info && <p><span className="font-medium">Kapcsolat:</span> {garage.contact_info}</p>}
                </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-[#88a0e8]">A termék nem található.</p>
            <Button
              className="mt-4 bg-[#4e77f4] hover:bg-[#5570c2] text-white px-4 py-2 rounded-lg cursor-pointer"
              onClick={() => navigate('/shop')}
            >
              Vissza a termékekhez
            </Button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}