import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import Header from "../components/ui/navbar";
import { motion } from "framer-motion";
import logo_light from '../assets/logo_lightMode.png';
import logo_dark from '../assets/logo_darkMode.png';

const Checkout = ({ isLoggedIn, userData, handleLogout }) => {
  const { darkMode, themeLoaded } = useTheme();
  const { cartItems, clearCart, handleCartLogout } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: userData?.name || "",
    email: userData?.email || "",
    phone: userData?.phone || "",
    address: "",
    paymentMethod: "card"
  });

  const [appointmentData, setAppointmentData] = useState({
    date: "",
    time: "",
    garageId: 1, // Default garage ID
  });

  const [availableTimes, setAvailableTimes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [garages, setGarages] = useState([]);

  // Format price with thousand separator
  const formatPrice = (price) => {
    return new Intl.NumberFormat('hu-HU').format(price);
  };

  // Handle logout with cart clear
  const handleLogoutWithCartClear = () => {
    handleCartLogout();
    handleLogout();
  };

  // Add this useEffect after your existing useEffects
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []); // Empty dependency array means it only runs once when component mounts

  // Check if cart is empty and redirect if necessary
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/shop');
    }
  }, [cartItems, navigate]);

  // Load garages for selection
  useEffect(() => {
    const fetchGarages = async () => {
      try {
        const response = await axios.get('http://localhost:3000/garages');
        if (Array.isArray(response.data)) {
          setGarages(response.data);
          if (response.data.length > 0) {
            setAppointmentData(prev => ({
              ...prev,
              garageId: response.data[0].id
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching garages:', error);
      }
    };

    fetchGarages();
  }, []);

  // Generate available time slots when date changes
  useEffect(() => {
    if (appointmentData.date) {
      generateTimeSlots(appointmentData.date);
    }
  }, [appointmentData.date, appointmentData.garageId]);

  const generateTimeSlots = async (date) => {
    try {
      // Fetch already booked appointments from your API
      const response = await axios.get('http://localhost:3000/appointments');
      const bookedAppointments = response.data.filter(
        app =>
          new Date(app.appointment_time).toDateString() === new Date(date).toDateString() &&
          app.garage_id === appointmentData.garageId
      );

      // Generate time slots from 8:00 to 18:00 with 1-hour intervals
      const timeSlots = [];
      for (let hour = 8; hour <= 18; hour++) {
        const timeString = `${hour.toString().padStart(2, '0')}:00`;

        // Check if this time is already booked
        const isBooked = bookedAppointments.some(app => {
          const appTime = new Date(app.appointment_time);
          return appTime.getHours() === hour;
        });

        if (!isBooked) {
          timeSlots.push(timeString);
        }
      }

      setAvailableTimes(timeSlots);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load available appointment times');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAppointmentChange = (e) => {
    const { name, value } = e.target;
    setAppointmentData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const userId = userData?.id || userData?.userId;

      if (!userId) {
        setError("Felhasználói azonosító hiányzik. Kérjük, jelentkezzen be újra.");
        setIsSubmitting(false);
        return;
      }

      // Get the selected garage ID from the appointment data
      const selectedGarageId = appointmentData.garageId;

      // Calculate total price
      const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

      // Prepare the items array from cart items
      const orderItems = cartItems.map(item => ({
        product_type: item.product_type,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.price
      }));

      // Debug logging
      console.log('Creating order with data:', {
        user_id: userId,
        garage_id: selectedGarageId,
        total_price: totalPrice,
        status: 'pending',
        items: orderItems // Include the items array
      });

      // 1. Create an order with items included
      const orderResponse = await axios.post('http://localhost:3000/orders', {
        user_id: userId,
        garage_id: selectedGarageId,
        total_price: totalPrice,
        status: 'pending',
        items: orderItems // Include the items array here
      });

      const orderId = orderResponse.data.id;

      // No need to create order items separately since they're included in the order creation

      // 3. Create appointment if time is selected
      let hasAppointment = false;
      if (appointmentData.date && appointmentData.time) {
        const appointmentDateTime = new Date(appointmentData.date);
        const [hours, minutes] = appointmentData.time.split(':').map(Number);
        appointmentDateTime.setHours(hours, minutes, 0, 0);

        await axios.post('http://localhost:3000/appointments', {
          user_id: userId,
          garage_id: appointmentData.garageId,
          appointment_time: appointmentDateTime.toISOString(),
          status: 'pending',
          order_id: orderId
        });

        hasAppointment = true;
      }

      // 4. Clear the cart
      await clearCart();

      // 5. Redirect to success page
      navigate('/checkout/success', {
        state: {
          orderId,
          hasAppointment
        }
      });

    } catch (error) {
      console.error('Error processing checkout:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        setError(`Failed to process your order: ${error.response.data.message || 'Please try again.'}`);
      } else {
        setError('Failed to process your order. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Format date for min attribute of date input (today's date)
  const today = new Date().toISOString().split('T')[0];

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
          <h1 className="text-3xl font-bold mb-8">Fizetés és időpontfoglalás</h1>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
            >
              {error}
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={`lg:col-span-1 rounded-xl shadow-lg overflow-hidden ${darkMode ? "bg-[#1e2129]" : "bg-white"}`}
            >
              <div className="h-3 bg-[#4e77f4]"></div>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Rendelés összesítő</h2>

                <div className={`overflow-y-auto max-h-80 mb-4 ${darkMode ? "scrollbar-dark" : "scrollbar-light"}`}>
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 mb-3 rounded-lg ${darkMode ? "bg-[#252830]" : "bg-gray-100"} flex justify-between`}
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                          {item.product_type === "service" ? "Szolgáltatás" : "Termék"}
                        </p>
                        <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                          Mennyiség: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatPrice(item.price)} Ft</p>
                        <p className="text-sm">{formatPrice(item.price * item.quantity)} Ft</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={`pt-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                  <div className="flex justify-between mb-2">
                    <span>Részösszeg:</span>
                    <span>{formatPrice(totalAmount)} Ft</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Szállítási díj:</span>
                    <span>0 Ft</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg mt-2">
                    <span>Összesen:</span>
                    <span>{formatPrice(totalAmount)} Ft</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Checkout Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`lg:col-span-2 rounded-xl shadow-lg overflow-hidden ${darkMode ? "bg-[#1e2129]" : "bg-white"}`}
            >
              <div className="h-3 bg-[#4e77f4]"></div>
              <div className="p-6">
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="md:col-span-2">
                      <h2 className="text-xl font-semibold mb-4">Szállítási és fizetési adatok</h2>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">Teljes név</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">Email cím</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">Telefonszám</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">Szállítási cím</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium">Fizetési mód</label>
                      <select
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                      >
                        <option value="card">Bankkártya</option>
                        <option value="transfer">Banki átutalás</option>
                        <option value="cash">Készpénz</option>
                      </select>
                    </div>

                    {/* Appointment Selection Section - Improved UI */}
                    <div className="md:col-span-2 border-t pt-6 mt-2">
                      <h2 className="text-xl font-semibold mb-4">Időpontfoglalás</h2>
                      <p className={`mb-4 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                        Ha szervizelést vagy beszerelést igénylő terméket rendelt, foglaljon időpontot az alábbi űrlapon.
                      </p>

                      {/* Service Selection Card */}
                      <div className={`p-4 rounded-lg mb-6 ${darkMode ? "bg-[#252830]" : "bg-gray-100"}`}>
                        <label className="block mb-2 text-sm font-medium">Szerviz kiválasztása</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {garages.map(garage => (
                            <div
                              key={garage.id}
                              onClick={() => setAppointmentData(prev => ({ ...prev, garageId: garage.id }))}
                              className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${appointmentData.garageId === garage.id
                                ? `${darkMode ? "border-[#4e77f4] bg-[#1e2129]" : "border-[#4e77f4] bg-white"}`
                                : `${darkMode ? "border-transparent" : "border-transparent"}`
                                }`}
                            >
                              <div className="flex items-start">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-1 ${appointmentData.garageId === garage.id
                                  ? "bg-[#4e77f4]"
                                  : `${darkMode ? "bg-[#3a3f4b]" : "bg-gray-300"}`
                                  }`}>
                                  {appointmentData.garageId === garage.id && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-medium">{garage.name}</h3>
                                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{garage.location}</p>
                                  {garage.phone && (
                                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                      <span className="inline-block mr-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                      </span>
                                      {garage.phone}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Date Selection */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block mb-2 text-sm font-medium">Dátum kiválasztása</label>
                          <div className={`p-4 rounded-lg ${darkMode ? "bg-[#252830]" : "bg-gray-100"}`}>
                            <input
                              type="date"
                              name="date"
                              min={today}
                              value={appointmentData.date}
                              onChange={handleAppointmentChange}
                              className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#1e2129] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                            />

                            {!appointmentData.date && (
                              <p className={`mt-3 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Válasszon egy dátumot az elérhető időpontok megtekintéséhez
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Time Selection */}
                        <div>
                          <label className="block mb-2 text-sm font-medium">Időpont kiválasztása</label>
                          <div className={`p-4 rounded-lg ${darkMode ? "bg-[#252830]" : "bg-gray-100"}`}>
                            {appointmentData.date ? (
                              availableTimes.length > 0 ? (
                                <div className="grid grid-cols-3 gap-2">
                                  {availableTimes.map(time => (
                                    <div
                                      key={time}
                                      onClick={() => setAppointmentData(prev => ({ ...prev, time }))}
                                      className={`p-2 rounded-lg text-center cursor-pointer transition-all ${appointmentData.time === time
                                        ? `bg-[#4e77f4] text-white`
                                        : `${darkMode ? "bg-[#1e2129] hover:bg-[#2a2f3a]" : "bg-white hover:bg-gray-100"}`
                                        }`}
                                    >
                                      {time}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-4">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <p className="text-sm text-red-500">Nincs elérhető időpont ezen a napon</p>
                                  <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                    Kérjük válasszon másik napot
                                  </p>
                                </div>
                              )
                            ) : (
                              <div className="text-center py-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                  Először válasszon dátumot
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Appointment Summary */}
                      {appointmentData.date && appointmentData.time && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`mt-6 p-4 rounded-lg border ${darkMode ? "bg-[#1e2129] border-[#4e77f4]" : "bg-blue-50 border-blue-200"}`}
                        >
                          <div className="flex items-start">
                            <div className="rounded-full bg-[#4e77f4] p-2 mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-medium">Foglalás megerősítve</h3>
                              <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                {garages.find(g => g.id === appointmentData.garageId)?.name} - {new Date(appointmentData.date).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}, {appointmentData.time}
                              </p>
                              <button
                                type="button"
                                onClick={() => setAppointmentData(prev => ({ ...prev, date: "", time: "" }))}
                                className="text-sm text-[#4e77f4] hover:text-[#3a5fc7] mt-1 flex items-center"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Időpont törlése
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <div className="mt-4">
                        <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"} mb-2`}>
                          Az időpontfoglalás opcionális. Ha nem választ időpontot, a rendelés feldolgozása után felvesszük Önnel a kapcsolatot.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-8 py-3 rounded-lg bg-[#4e77f4] hover:bg-[#3a5fc7] text-white font-medium transition-colors ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                      {isSubmitting ? "Feldolgozás..." : "Rendelés leadása"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
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

export default Checkout;