import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import Header from "../components/ui/navbar";
import logo_light from '../assets/logo_lightMode.png';
import logo_dark from '../assets/logo_darkMode.png';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import CartSidebar from '../components/ui/CartSidebar';
import ProductCard from '../components/ui/ProductCard'; // Import the ProductCard component
import axios from 'axios';

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
  const [services, setServices] = useState([]);
  const [isServiceFilter, setIsServiceFilter] = useState(false);
  const [filteredServiceId, setFilteredServiceId] = useState(null);

  // State for tyre size filters
  const [widthOptions, setWidthOptions] = useState([]);
  const [profileOptions, setProfileOptions] = useState([]);
  const [diameterOptions, setDiameterOptions] = useState([]);
  const [selectedWidth, setSelectedWidth] = useState("");
  const [selectedProfile, setSelectedProfile] = useState("");
  const [selectedDiameter, setSelectedDiameter] = useState("");
  const [showSizeFilter, setShowSizeFilter] = useState(false);

  // Handle logout with cart clear
  const handleLogoutWithCartClear = () => {
    handleCartLogout();
    handleLogout();
  };

  // Add this useEffect after your existing useEffects
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [location.search]); // Dependency on location.search ensures it runs when filters change

  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    const garageParams = params.getAll('garage');
    const serviceParam = params.get('service');
    const vehicleTypeParams = params.getAll('type');
    const seasonParams = params.getAll('season');
    const widthParam = params.get('width');
    const profileParam = params.get('profile');
    const diameterParam = params.get('diameter');

    // Handle search parameter
    if (searchParam) {
      setShopSearchQuery(searchParam);
    }

    // Handle vehicle type parameters
    if (vehicleTypeParams.length > 0) {
      setSelectedVehicleTypes(vehicleTypeParams);
    }

    // Handle season parameters
    if (seasonParams.length > 0) {
      setSelectedSeasons(seasonParams);
    }

    // Handle size parameters
    if (widthParam) {
      setSelectedWidth(widthParam);
    }

    if (profileParam) {
      setSelectedProfile(profileParam);
    }

    if (diameterParam) {
      setSelectedDiameter(diameterParam);
    }

    // Handle garage parameters
    if (garageParams.length > 0) {
      const garageIds = garageParams.map(id => parseInt(id));
      setSelectedGarages(garageIds);
      setIsServiceFilter(false);
    } else if (serviceParam) {
      // Handle service parameter - find the garage that offers this service
      const serviceId = parseInt(serviceParam);
      const service = services.find(s => s.id === serviceId);
      if (service) {
        setSelectedGarages([service.garage_id]);
        setIsServiceFilter(true);
        setFilteredServiceId(serviceId);
      }
    } else {
      // Reset filters if no parameters
      setSelectedGarages([]);
      setIsServiceFilter(false);
      setFilteredServiceId(null);
    }
  }, [location.search, services]);

  // Initialize cart when user logs in
  useEffect(() => {
    if (isLoggedIn && userData) {
      // Use the first garage as default if none selected
      const defaultGarageId = selectedGarages.length > 0 ? selectedGarages[0] : (garages.length > 0 ? garages[0].id : 1);
      initializeCart(userData.id, defaultGarageId);
    }
  }, [isLoggedIn, userData, garages, selectedGarages, initializeCart]);

  // Handle adding item to cart
  const handleAddToCart = async (e, item) => {
    e.stopPropagation(); // Prevent event bubbling

    // Try to add to cart
    const success = await addToCart('inventory', item.id, 1);

    // Only open cart if successfully added
    if (success) {
      setIsCartOpen(true);
    }
  };

  // Extract unique values for size filters
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

  // Fetch garages, inventory items, and services
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch garages
        const garagesResponse = await axios.get('http://localhost:3000/garages');
        setGarages(garagesResponse.data);

        // Fetch inventory items
        const inventoryResponse = await axios.get('http://localhost:3000/inventory');
        setInventoryItems(inventoryResponse.data);

        // Extract size options for filters
        extractSizeOptions(inventoryResponse.data);

        // Fetch services
        const servicesResponse = await axios.get('http://localhost:3000/services');
        setServices(servicesResponse.data);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter items based on search query, selected garages, vehicle types, seasons, and sizes
  useEffect(() => {
    let filtered = inventoryItems;

    // Filter by garages if selected
    if (selectedGarages.length > 0) {
      filtered = filtered.filter(item => selectedGarages.includes(item.garage_id));
    }

    // Filter by vehicle types if selected
    if (selectedVehicleTypes.length > 0) {
      filtered = filtered.filter(item => selectedVehicleTypes.includes(item.vehicle_type));
    }

    // Filter by seasons if selected
    if (selectedSeasons.length > 0) {
      filtered = filtered.filter(item => item.season && selectedSeasons.includes(item.season));
    }

    // Filter by tyre size if selected
    if (selectedWidth) {
      filtered = filtered.filter(item => item.width && item.width.toString() === selectedWidth);
    }

    if (selectedProfile) {
      filtered = filtered.filter(item => item.profile && item.profile.toString() === selectedProfile);
    }

    if (selectedDiameter) {
      filtered = filtered.filter(item => item.diameter && item.diameter.toString() === selectedDiameter);
    }

    // Filter by shop search query if present
    if (shopSearchQuery) {
      const query = shopSearchQuery.toLowerCase();

      // Find matching garages
      const matchingGarageIds = garages
        .filter(garage =>
          garage.name.toLowerCase().includes(query) ||
          garage.location.toLowerCase().includes(query)
        )
        .map(garage => garage.id);

      // Find matching services
      const matchingServiceGarageIds = services
        .filter(service =>
          service.name.toLowerCase().includes(query) ||
          (service.description && service.description.toLowerCase().includes(query))
        )
        .map(service => service.garage_id);

      // Combine matching garage IDs
      const allMatchingGarageIds = [...new Set([...matchingGarageIds, ...matchingServiceGarageIds])];

      // Filter inventory items by matching garages or by item name
      filtered = filtered.filter(item =>
        allMatchingGarageIds.includes(item.garage_id) ||
        item.item_name.toLowerCase().includes(query)
      );
    }

    setFilteredItems(filtered);
  }, [shopSearchQuery, selectedGarages, selectedVehicleTypes, selectedSeasons, selectedWidth, selectedProfile, selectedDiameter, inventoryItems, garages, services]);

  // Toggle garage filter
  const toggleGarageFilter = (garageId) => {
    setSelectedGarages(prev => {
      // If already selected, remove it
      if (prev.includes(garageId)) {
        return prev.filter(id => id !== garageId);
      }
      // Otherwise add it
      return [...prev, garageId];
    });

    // Update URL without redirecting
    updateURL();
  };

  // Toggle vehicle type filter
  const toggleVehicleTypeFilter = (vehicleType) => {
    setSelectedVehicleTypes(prev => {
      // If already selected, remove it
      if (prev.includes(vehicleType)) {
        return prev.filter(type => type !== vehicleType);
      }
      // Otherwise add it
      return [...prev, vehicleType];
    });

    // Update URL without redirecting
    updateURL();
  };

  // Toggle season filter
  const toggleSeasonFilter = (season) => {
    setSelectedSeasons(prev => {
      // If already selected, remove it
      if (prev.includes(season)) {
        return prev.filter(s => s !== season);
      }
      // Otherwise add it
      return [...prev, season];
    });

    // Update URL without redirecting
    updateURL();
  };

  // Handle size filter change
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

    // Update URL without redirecting
    updateURL();
  };

  // Helper function to update URL with all filters
  const updateURL = () => {
    const params = new URLSearchParams();

    // Add all selected garages
    selectedGarages.forEach(garageId => {
      params.append('garage', garageId);
    });

    // Add all selected vehicle types
    selectedVehicleTypes.forEach(vehicleType => {
      params.append('type', vehicleType);
    });

    // Add all selected seasons
    selectedSeasons.forEach(season => {
      params.append('season', season);
    });

    // Add size filters if present
    if (selectedWidth) {
      params.append('width', selectedWidth);
    }

    if (selectedProfile) {
      params.append('profile', selectedProfile);
    }

    if (selectedDiameter) {
      params.append('diameter', selectedDiameter);
    }

    // Add search query if present
    if (shopSearchQuery) {
      params.append('search', shopSearchQuery);
    }

    const queryString = params.toString();
    const url = queryString ? `/shop?${queryString}` : '/shop';

    window.history.pushState({}, '', url);
  };

  // Handle shop search
  const handleShopSearch = (e) => {
    e.preventDefault();

    // Update URL with all current filters
    updateURL();
  };

  // Get season display name
  const getSeasonDisplayName = (season) => {
    switch (season) {
      case 'winter': return 'Téli';
      case 'summer': return 'Nyári';
      case 'all_season': return 'Négyévszakos';
      default: return 'Ismeretlen';
    }
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

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedGarages([]);
    setSelectedVehicleTypes([]);
    setSelectedSeasons([]);
    setSelectedWidth("");
    setSelectedProfile("");
    setSelectedDiameter("");
    setShopSearchQuery('');
    setIsServiceFilter(false);
    setFilteredServiceId(null);
    window.history.pushState({}, '', '/shop');
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
        handleLogout={handleLogoutWithCartClear}
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

        {/* Shop search bar */}
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

        {/* Garage filter section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Szervízek</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setSelectedGarages([])}
              className={`px-4 py-2 rounded-lg ${selectedGarages.length === 0
                ? 'bg-[#4e77f4] text-white'
                : darkMode ? 'bg-[#252830] text-white' : 'bg-gray-200 text-black'}`}
            >
              Összes
            </Button>
            {garages.map(garage => (
              <Button
                key={garage.id}
                onClick={() => toggleGarageFilter(garage.id)}
                className={`px-4 py-2 rounded-lg ${selectedGarages.includes(garage.id)
                  ? 'bg-[#4e77f4] text-white'
                  : darkMode ? 'bg-[#252830] text-white' : 'bg-gray-200 text-black'}`}
              >
                {garage.name}
                {selectedGarages.includes(garage.id) && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-white text-[#4e77f4] rounded-full text-xs font-bold">
                    ✓
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Vehicle type filter section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Jármű típus</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setSelectedVehicleTypes([])}
              className={`px-4 py-2 rounded-lg ${selectedVehicleTypes.length === 0
                ? 'bg-[#4e77f4] text-white'
                : darkMode ? 'bg-[#252830] text-white' : 'bg-gray-200 text-black'}`}
            >
              Összes
            </Button>
            {['car', 'motorcycle', 'truck'].map(type => (
              <Button
                key={type}
                onClick={() => toggleVehicleTypeFilter(type)}
                className={`px-4 py-2 rounded-lg ${selectedVehicleTypes.includes(type)
                  ? 'bg-[#4e77f4] text-white'
                  : darkMode ? 'bg-[#252830] text-white' : 'bg-gray-200 text-black'}`}
              >
                {getVehicleTypeDisplayName(type)}
                {selectedVehicleTypes.includes(type) && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-white text-[#4e77f4] rounded-full text-xs font-bold">
                    ✓
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Season filter section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Évszak</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setSelectedSeasons([])}
              className={`px-4 py-2 rounded-lg ${selectedSeasons.length === 0
                ? 'bg-[#4e77f4] text-white'
                : darkMode ? 'bg-[#252830] text-white' : 'bg-gray-200 text-black'}`}
            >
              Összes
            </Button>
            {['winter', 'summer', 'all_season'].map(season => (
              <Button
                key={season}
                onClick={() => toggleSeasonFilter(season)}
                className={`px-4 py-2 rounded-lg ${selectedSeasons.includes(season)
                  ? 'bg-[#4e77f4] text-white'
                  : darkMode ? 'bg-[#252830] text-white' : 'bg-gray-200 text-black'}`}
              >
                {getSeasonDisplayName(season)}
                {selectedSeasons.includes(season) && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-white text-[#4e77f4] rounded-full text-xs font-bold">
                    ✓
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Tyre size filter section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Gumiméret</h2>
            <button
              onClick={() => setShowSizeFilter(!showSizeFilter)}
              className="text-[#4e77f4] hover:text-[#5570c2] font-medium flex items-center"
            >
              {showSizeFilter ? (
                <>
                  <span>Elrejtés</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </>
              ) : (
                <>
                  <span>Megjelenítés</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </>
              )}
            </button>
          </div>

          {showSizeFilter && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Width filter */}
              <div>
                <h3 className="text-sm font-medium mb-2">Szélesség (mm)</h3>
                <div className="flex flex-wrap gap-2">
                  {widthOptions.map(width => (
                    <Button
                      key={`width-${width}`}
                      onClick={() => handleSizeFilterChange('width', width)}
                      className={`px-3 py-1 text-sm rounded-lg ${selectedWidth === width
                        ? 'bg-[#4e77f4] text-white'
                        : darkMode ? 'bg-[#252830] text-white' : 'bg-gray-200 text-black'}`}
                    >
                      {width}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Profile filter */}
              <div>
                <h3 className="text-sm font-medium mb-2">Profil (%)</h3>
                <div className="flex flex-wrap gap-2">
                  {profileOptions.map(profile => (
                    <Button
                      key={`profile-${profile}`}
                      onClick={() => handleSizeFilterChange('profile', profile)}
                      className={`px-3 py-1 text-sm rounded-lg ${selectedProfile === profile
                        ? 'bg-[#4e77f4] text-white'
                        : darkMode ? 'bg-[#252830] text-white' : 'bg-gray-200 text-black'}`}
                    >
                      {profile}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Diameter filter */}
              <div>
                <h3 className="text-sm font-medium mb-2">Átmérő (col)</h3>
                <div className="flex flex-wrap gap-2">
                  {diameterOptions.map(diameter => (
                    <Button
                      key={`diameter-${diameter}`}
                      onClick={() => handleSizeFilterChange('diameter', diameter)}
                      className={`px-3 py-1 text-sm rounded-lg ${selectedDiameter === diameter
                        ? 'bg-[#4e77f4] text-white'
                        : darkMode ? 'bg-[#252830] text-white' : 'bg-gray-200 text-black'}`}
                    >
                      {diameter}"
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filter information messages */}
        {shopSearchQuery && (
          <div className="mb-6">
            <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Keresési eredmények a következőre: <span className="font-semibold">"{shopSearchQuery}"</span>
            </p>
          </div>
        )}

        {isServiceFilter && filteredServiceId && !shopSearchQuery && (
          <div className="mb-6">
            <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Termékek a következő szolgáltatáshoz: <span className="font-semibold">"{services.find(s => s.id === filteredServiceId)?.name || 'Szolgáltatás'}"</span>
            </p>
          </div>
        )}

        {/* Active filters display */}
        {(selectedGarages.length > 0 || selectedVehicleTypes.length > 0 || selectedSeasons.length > 0 || selectedWidth || selectedProfile || selectedDiameter || shopSearchQuery) && (
          <div className="mb-6">
            <div className="p-4 rounded-lg border-2 border-[#4e77f4] bg-[#4e77f4]/10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-[#4e77f4]">Aktív szűrők</h3>
                <button
                  onClick={clearAllFilters}
                  className={`px-3 py-1 text-sm rounded-full ${darkMode ? "bg-[#252830] text-white hover:bg-[#353b48]" : "bg-gray-200 text-black hover:bg-gray-300"}`}
                >
                  Összes szűrő törlése
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {selectedGarages.map(garageId => {
                  const garage = garages.find(g => g.id === garageId);
                  return garage ? (
                    <span key={`garage-${garageId}`} className="px-3 py-1 bg-[#4e77f4] text-white text-sm rounded-full flex items-center">
                      Szervíz: {garage.name}
                      <button
                        onClick={() => toggleGarageFilter(garageId)}
                        className="ml-2 focus:outline-none"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ) : null;
                })}

                {selectedVehicleTypes.map(type => (
                  <span key={`type-${type}`} className="px-3 py-1 bg-[#4e77f4] text-white text-sm rounded-full flex items-center">
                    Járműtípus: {getVehicleTypeDisplayName(type)}
                    <button
                      onClick={() => toggleVehicleTypeFilter(type)}
                      className="ml-2 focus:outline-none"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}

                {selectedSeasons.map(season => (
                  <span key={`season-${season}`} className="px-3 py-1 bg-[#4e77f4] text-white text-sm rounded-full flex items-center">
                    Évszak: {getSeasonDisplayName(season)}
                    <button
                      onClick={() => toggleSeasonFilter(season)}
                      className="ml-2 focus:outline-none"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}

                {selectedWidth && (
                  <span className="px-3 py-1 bg-[#4e77f4] text-white text-sm rounded-full flex items-center">
                    Szélesség: {selectedWidth} mm
                    <button
                      onClick={() => {
                        setSelectedWidth("");
                        updateURL();
                      }}
                      className="ml-2 focus:outline-none"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}

                {selectedProfile && (
                  <span className="px-3 py-1 bg-[#4e77f4] text-white text-sm rounded-full flex items-center">
                    Profil: {selectedProfile}%
                    <button
                      onClick={() => {
                        setSelectedProfile("");
                        updateURL();
                      }}
                      className="ml-2 focus:outline-none"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}

                {selectedDiameter && (
                  <span className="px-3 py-1 bg-[#4e77f4] text-white text-sm rounded-full flex items-center">
                    Átmérő: {selectedDiameter}"
                    <button
                      onClick={() => {
                        setSelectedDiameter("");
                        updateURL();
                      }}
                      className="ml-2 focus:outline-none"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
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
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

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
            // Display inventory items using the ProductCard component
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
            // No items found
            <div className="col-span-full text-center py-12">
              <p className="text-xl text-[#88a0e8]">
                {shopSearchQuery
                  ? 'Nincs találat a keresési feltételeknek megfelelően.'
                  : selectedVehicleTypes.length > 0 || selectedSeasons.length > 0 || selectedWidth || selectedProfile || selectedDiameter
                    ? 'Nincs termék a kiválasztott szűrőknek megfelelően.'
                    : selectedGarages.length > 0
                      ? 'Nincs termék a kiválasztott szervízekben.'
                      : isServiceFilter
                        ? 'Nincs termék a kiválasztott szolgáltatáshoz.'
                        : 'Nem található termék.'}
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