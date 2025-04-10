import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/ui/navbar";
import logo_light from '../assets/logo_lightMode.png';
import logo_dark from '../assets/logo_darkMode.png';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import CartSidebar from '../components/ui/CartSidebar';
import ProductCard from '../components/ui/ProductCard';
import FilterSidebar from '../components/ui/FilterSidebar';
import axios from 'axios';
import Footer from "../components/ui/Footer";

export default function ShopPage({
  setIsLoginOpen,
  setIsRegisterOpen,
  isLoggedIn,
  userData,
  handleLogout
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, themeLoaded } = useTheme();
  const { addToCart, cartItems, initializeCart, handleCartLogout } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [shopSearchQuery, setShopSearchQuery] = useState("");
  const [garages, setGarages] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGarages, setSelectedGarages] = useState([]);
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState([]);
  const [selectedSeasons, setSelectedSeasons] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [widthOptions, setWidthOptions] = useState([]);
  const [profileOptions, setProfileOptions] = useState([]);
  const [diameterOptions, setDiameterOptions] = useState([]);
  const [selectedWidth, setSelectedWidth] = useState("");
  const [selectedProfile, setSelectedProfile] = useState("");
  const [selectedDiameter, setSelectedDiameter] = useState("");
  const [showSizeFilter, setShowSizeFilter] = useState(false);

  const [showFilters, setShowFilters] = useState(true);
  const [showGarageFilter, setShowGarageFilter] = useState(true);
  const [showVehicleTypeFilter, setShowVehicleTypeFilter] = useState(true);
  const [showSeasonFilter, setShowSeasonFilter] = useState(true);

  const handleLogoutWithCartClear = () => {
    handleCartLogout();
    handleLogout();
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    const garageParams = params.getAll('garage');
    const vehicleTypeParams = params.getAll('type');
    const seasonParams = params.getAll('season');
    const widthParam = params.get('width');
    const profileParam = params.get('profile');
    const diameterParam = params.get('diameter');

    if (searchParam) {
      setShopSearchQuery(searchParam);
    }

    if (vehicleTypeParams.length > 0) {
      setSelectedVehicleTypes(vehicleTypeParams);
    }

    if (seasonParams.length > 0) {
      setSelectedSeasons(seasonParams);
    }

    if (widthParam) {
      setSelectedWidth(widthParam);
    }

    if (profileParam) {
      setSelectedProfile(profileParam);
    }

    if (diameterParam) {
      setSelectedDiameter(diameterParam);
    }

    if (garageParams.length > 0) {
      const garageIds = garageParams.map(id => parseInt(id));
      setSelectedGarages(garageIds);
    } else {
      setSelectedGarages([]);
    }
  }, [location.search]);

  useEffect(() => {
    if (isLoggedIn && userData) {
      const defaultGarageId = selectedGarages.length > 0 ? selectedGarages[0] : (garages.length > 0 ? garages[0].id : 1);
      initializeCart(userData.id, defaultGarageId);
    }
  }, [isLoggedIn, userData, garages, selectedGarages, initializeCart]);

  const handleAddToCart = async (e, item) => {
    e.stopPropagation();

    const success = await addToCart(item.id, 1);

    if (success) {
      setIsCartOpen(true);
    }
  };

  const extractSizeOptions = (items) => {
    const widths = new Set();
    const profiles = new Set();
    const diameters = new Set();

    items.forEach(item => {
      if (item.width) widths.add(item.width.toString());
      if (item.profile) profiles.add(item.profile.toString());
      if (item.diameter) diameters.add(item.diameter.toString());
    });

    setWidthOptions(Array.from(widths).sort((a, b) => parseInt(a) - parseInt(b)));
    setProfileOptions(Array.from(profiles).sort((a, b) => parseInt(a) - parseInt(b)));
    setDiameterOptions(Array.from(diameters).sort((a, b) => parseInt(a) - parseInt(b)));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const garagesResponse = await axios.get('http://localhost:3000/garages');
        setGarages(garagesResponse.data);

        const inventoryResponse = await axios.get('http://localhost:3000/inventory');
        setInventoryItems(inventoryResponse.data);

        extractSizeOptions(inventoryResponse.data);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = inventoryItems;

    if (selectedGarages.length > 0) {
      filtered = filtered.filter(item => selectedGarages.includes(item.garage_id));
    }

    if (selectedVehicleTypes.length > 0) {
      filtered = filtered.filter(item => selectedVehicleTypes.includes(item.vehicle_type));
    }

    if (selectedSeasons.length > 0) {
      filtered = filtered.filter(item => item.season && selectedSeasons.includes(item.season));
    }

    if (selectedWidth) {
      filtered = filtered.filter(item => item.width && item.width.toString() === selectedWidth);
    }

    if (selectedProfile) {
      filtered = filtered.filter(item => item.profile && item.profile.toString() === selectedProfile);
    }

    if (selectedDiameter) {
      filtered = filtered.filter(item => item.diameter && item.diameter.toString() === selectedDiameter);
    }

    if (shopSearchQuery) {
      const query = shopSearchQuery.toLowerCase();

      const matchingGarageIds = garages
        .filter(garage =>
          garage.name.toLowerCase().includes(query) ||
          garage.location.toLowerCase().includes(query)
        )
        .map(garage => garage.id);

      filtered = filtered.filter(item =>
        matchingGarageIds.includes(item.garage_id) ||
        item.item_name.toLowerCase().includes(query)
      );
    }

    setFilteredItems(filtered);
  }, [shopSearchQuery, selectedGarages, selectedVehicleTypes, selectedSeasons, selectedWidth, selectedProfile, selectedDiameter, inventoryItems, garages]);

  const toggleGarageFilter = (garageId) => {
    setSelectedGarages(prev => {
      if (prev.includes(garageId)) {
        return prev.filter(id => id !== garageId);
      }
      return [...prev, garageId];
    });

    updateURL();
  };

  const toggleVehicleTypeFilter = (vehicleType) => {
    setSelectedVehicleTypes(prev => {
      if (prev.includes(vehicleType)) {
        return prev.filter(type => type !== vehicleType);
      }
      return [...prev, vehicleType];
    });

    updateURL();
  };

  const toggleSeasonFilter = (season) => {
    setSelectedSeasons(prev => {
      if (prev.includes(season)) {
        return prev.filter(s => s !== season);
      }
      return [...prev, season];
    });

    updateURL();
  };

  const handleSizeFilterChange = (type, value) => {
    switch (type) {
      case 'width':
        setSelectedWidth(prev => prev === value ? "" : value);
        break;
      case 'profile':
        setSelectedProfile(prev => prev === value ? "" : value);
        break;
      case 'diameter':
        setSelectedDiameter(prev => prev === value ? "" : value);
        break;
      default:
        break;
    }

    updateURL();
  };

  const updateURL = () => {
    const params = new URLSearchParams();

    selectedGarages.forEach(garageId => {
      params.append('garage', garageId);
    });

    selectedVehicleTypes.forEach(vehicleType => {
      params.append('type', vehicleType);
    });

    selectedSeasons.forEach(season => {
      params.append('season', season);
    });

    if (selectedWidth) {
      params.append('width', selectedWidth);
    }

    if (selectedProfile) {
      params.append('profile', selectedProfile);
    }

    if (selectedDiameter) {
      params.append('diameter', selectedDiameter);
    }

    if (shopSearchQuery) {
      params.append('search', shopSearchQuery);
    }

    const queryString = params.toString();
    const url = queryString ? `/shop?${queryString}` : '/shop';

    window.history.pushState({}, '', url);
  };

  const handleShopSearch = (e) => {
    e.preventDefault();

    updateURL();
  };

  const getSeasonDisplayName = (season) => {
    switch (season) {
      case 'winter': return 'Téli';
      case 'summer': return 'Nyári';
      case 'all_season': return 'Négyévszakos';
      default: return 'Ismeretlen';
    }
  };

  const getVehicleTypeDisplayName = (type) => {
    switch (type) {
      case 'car': return 'Személygépkocsi';
      case 'motorcycle': return 'Motorkerékpár';
      case 'truck': return 'Teherautó';
      default: return 'Ismeretlen';
    }
  };

  const clearAllFilters = () => {
    setSelectedGarages([]);
    setSelectedVehicleTypes([]);
    setSelectedSeasons([]);
    setSelectedWidth("");
    setSelectedProfile("");
    setSelectedDiameter("");
    setShopSearchQuery('');
    window.history.pushState({}, '', '/shop');
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Gumiszervíz Webshop</h1>

        <div className="mb-8">
          <form onSubmit={handleShopSearch} className="w-full max-w-xl">
            <div className={`flex items-center ${darkMode ? "bg-[#252830]" : "bg-gray-200"} rounded-lg overflow-hidden`}>
              <input
                type="text"
                placeholder="Keresés a webshopban..."
                value={shopSearchQuery}
                onChange={(e) => setShopSearchQuery(e.target.value)}
                className={`w-full p-3 ${darkMode ? "text-white" : "text-black"} bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-[#4e77f4] ${darkMode ? "placeholder-gray-400" : "placeholder-gray-500"}`}
              />
              <button
                type="submit"
                className="p-3 bg-[#5671c2] text-white cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <FilterSidebar
            darkMode={darkMode}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            selectedGarages={selectedGarages}
            selectedVehicleTypes={selectedVehicleTypes}
            selectedSeasons={selectedSeasons}
            selectedWidth={selectedWidth}
            selectedProfile={selectedProfile}
            selectedDiameter={selectedDiameter}
            shopSearchQuery={shopSearchQuery}
            clearAllFilters={clearAllFilters}
            showGarageFilter={showGarageFilter}
            setShowGarageFilter={setShowGarageFilter}
            showVehicleTypeFilter={showVehicleTypeFilter}
            setShowVehicleTypeFilter={setShowVehicleTypeFilter}
            showSeasonFilter={showSeasonFilter}
            setShowSeasonFilter={setShowSeasonFilter}
            showSizeFilter={showSizeFilter}
            setShowSizeFilter={setShowSizeFilter}
            garages={garages}
            toggleGarageFilter={toggleGarageFilter}
            getVehicleTypeDisplayName={getVehicleTypeDisplayName}
            toggleVehicleTypeFilter={toggleVehicleTypeFilter}
            getSeasonDisplayName={getSeasonDisplayName}
            toggleSeasonFilter={toggleSeasonFilter}
            widthOptions={widthOptions}
            profileOptions={profileOptions}
            diameterOptions={diameterOptions}
            handleSizeFilterChange={handleSizeFilterChange}
            setSelectedGarages={setSelectedGarages}
            setSelectedVehicleTypes={setSelectedVehicleTypes}
            setSelectedSeasons={setSelectedSeasons}
          />

          <div className="lg:w-3/4">
            {(selectedGarages.length > 0 || selectedVehicleTypes.length > 0 || selectedSeasons.length > 0 ||
              selectedWidth || selectedProfile || selectedDiameter || shopSearchQuery) && (
                <div className="mb-6">
                  <div className={`p-4 rounded-lg ${darkMode ? "bg-[#0d1117]" : "bg-gray-50"} shadow-sm`}>
                    <h3 className="font-semibold text-[#4e77f4] mb-2">Aktív szűrők</h3>

                    <div className="flex flex-wrap gap-2">
                      {selectedGarages.map(garageId => {
                        const garage = garages.find(g => g.id === garageId);
                        return garage ? (
                          <span key={`garage-${garageId}`} className="px-3 py-1 bg-[#4e77f4] text-white text-sm rounded-full flex items-center">
                            {garage.name}
                            <button
                              onClick={() => toggleGarageFilter(garageId)}
                              className="ml-2 focus:outline-none"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 cursor-pointer">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        ) : null;
                      })}

                      {selectedVehicleTypes.map(type => (
                        <span key={`type-${type}`} className="px-3 py-1 bg-[#4e77f4] text-white text-sm rounded-full flex items-center">
                          {getVehicleTypeDisplayName(type)}
                          <button
                            onClick={() => toggleVehicleTypeFilter(type)}
                            className="ml-2 focus:outline-none"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 cursor-pointer">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}

                      {selectedSeasons.map(season => (
                        <span key={`season-${season}`} className="px-3 py-1 bg-[#4e77f4] text-white text-sm rounded-full flex items-center">
                          {getSeasonDisplayName(season)}
                          <button
                            onClick={() => toggleSeasonFilter(season)}
                            className="ml-2 focus:outline-none"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 cursor-pointer">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}

                      {selectedWidth && (
                        <span className="px-3 py-1 bg-[#4e77f4] text-white text-sm rounded-full flex items-center">
                          {selectedWidth} mm
                          <button
                            onClick={() => {
                              setSelectedWidth("");
                              updateURL();
                            }}
                            className="ml-2 focus:outline-none"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 cursor-pointer">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      )}

                      {selectedProfile && (
                        <span className="px-3 py-1 bg-[#4e77f4] text-white text-sm rounded-full flex items-center">
                          {selectedProfile}%
                          <button
                            onClick={() => {
                              setSelectedProfile("");
                              updateURL();
                            }}
                            className="ml-2 focus:outline-none"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 cursor-pointer">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      )}

                      {selectedDiameter && (
                        <span className="px-3 py-1 bg-[#4e77f4] text-white text-sm rounded-full flex items-center">
                          {selectedDiameter}"
                          <button
                            onClick={() => {
                              setSelectedDiameter("");
                              updateURL();
                            }}
                            className="ml-2 focus:outline-none"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 cursor-pointer">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      )}

                      {shopSearchQuery && (
                        <span className="px-3 py-1 bg-[#4e77f4] text-white text-sm rounded-full flex items-center">
                          Keresés: {shopSearchQuery}
                          <button
                            onClick={() => {
                              setShopSearchQuery('');
                              updateURL();
                            }}
                            className="ml-2 focus:outline-none"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 cursor-pointer">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

            {shopSearchQuery && (
              <div className="mb-6">
                <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Keresési eredmények a következőre: <span className="font-semibold">"{shopSearchQuery}"</span>
                </p>
              </div>
            )}

            <div className="mb-4">
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                {filteredItems.length} termék található
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {loading ? (
                Array(6).fill().map((_, index) => (
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
                filteredItems.map(item => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    garage={garages.find(g => g.id === item.garage_id)}
                    onAddToCart={handleAddToCart}
                    onClick={() => navigate(`/item/${item.id}`)}
                    isLoggedIn={isLoggedIn}
                    setIsLoginOpen={setIsLoginOpen}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xl text-[#88a0e8] mb-2">
                    {shopSearchQuery
                      ? 'Nincs találat a keresési feltételeknek megfelelően.'
                      : selectedVehicleTypes.length > 0 || selectedSeasons.length > 0 || selectedWidth || selectedProfile || selectedDiameter
                        ? 'Nincs termék a kiválasztott szűrőknek megfelelően.'
                        : selectedGarages.length > 0
                          ? 'Nincs termék a kiválasztott szervízekben.'
                          : 'Nem található termék.'}
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="mt-4 px-4 py-2 bg-[#4e77f4] text-white rounded-md hover:bg-[#3d66e3] transition-colors"
                  >
                    Szűrők törlése
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}