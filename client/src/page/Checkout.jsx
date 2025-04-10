import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import Header from "../components/ui/navbar";
import Footer from "../components/ui/Footer";
import { motion } from "framer-motion";
import logo_light from '../assets/logo_lightMode.png';
import logo_dark from '../assets/logo_darkMode.png';
import { format } from 'date-fns';

const Checkout = ({ isLoggedIn, userData, handleLogout }) => {
  const { darkMode, themeLoaded } = useTheme();
  const { cartItems, clearCart, handleCartLogout } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    first_name: userData?.first_name || "",
    last_name: userData?.last_name || "",
    email: userData?.email || "",
    phone: userData?.phone || "",
  });

  const [appointmentData, setAppointmentData] = useState({
    date: "",
    time: "",
    garageId: null,
  });

  const [availableTimes, setAvailableTimes] = useState([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [garages, setGarages] = useState([]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('hu-HU').format(price);
  };

  const handleLogoutWithCartClear = () => {
    handleCartLogout();
    handleLogout();
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/shop');
    }
  }, [cartItems, navigate]);

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

  useEffect(() => {
    if (appointmentData.date && appointmentData.garageId) {
      generateTimeSlots(appointmentData.date);
    }
  }, [appointmentData.date, appointmentData.garageId]);

  const generateTimeSlots = async (date) => {
    try {
      if (!appointmentData.garageId) {
        setError("Kérjük, először válasszon szervizt");
        return;
      }

      setLoadingTimes(true);
      setAvailableTimes([]);

      const formattedDate = format(new Date(date), 'yyyy-MM-dd');

      const response = await axios.get(
        `http://localhost:3000/garages/${appointmentData.garageId}/available-slots?date=${formattedDate}`
      );

      if (Array.isArray(response.data)) {
        const availableSlots = response.data
          .filter(slot => !slot.is_full)
          .map(slot => slot.start_time.substring(0, 5));

        setAvailableTimes(availableSlots);

        if (availableSlots.length === 0) {
        }
      } else {
        console.error("Unexpected response format:", response.data);
        setError("Nem sikerült betölteni az elérhető időpontokat");
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setError('Nem sikerült betölteni az elérhető időpontokat');
    } finally {
      setLoadingTimes(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAppointmentChange = (e) => {
    const { name, value } = e.target;

    if (name === 'date') {
      setAppointmentData(prev => ({ ...prev, [name]: value, time: "" }));
    } else {
      setAppointmentData(prev => ({ ...prev, [name]: value }));
    }
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

      const selectedGarageId = appointmentData.garageId;

      const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

      const orderItems = cartItems.map(item => ({
        product_type: item.product_type,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.price
      }));

      const orderResponse = await axios.post('http://localhost:3000/orders', {
        user_id: userId,
        garage_id: selectedGarageId,
        total_price: totalPrice,
        status: 'pending',
        items: orderItems
      });

      const orderId = orderResponse.data.id;


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

      await clearCart();

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
        setError(`Nem sikerült feldolgozni a rendelést: ${error.response.data.message || 'Kérjük, próbálja újra.'}`);
      } else {
        setError('Nem sikerült feldolgozni a rendelést. Kérjük, próbálja újra.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const today = new Date().toISOString().split('T')[0];

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
                  <div className="flex justify-between font-bold text-lg mt-2">
                    <span>Összesen:</span>
                    <span>{formatPrice(totalAmount)} Ft</span>
                  </div>
                  <div className="mt-2 text-sm text-center">
                    <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                      Fizetés módja: Készpénz 
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

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
                      <h2 className="text-xl font-semibold mb-4">Fizetési adatok</h2>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">Vezetéknév</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        required
                        className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">Keresztnév</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
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

                    <div className="md:col-span-2">
                      <div className={`p-4 rounded-lg ${darkMode ? "bg-[#252830]" : "bg-gray-100"}`}>
                        <div className="flex items-center">
                          <div className="mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#4e77f4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">Fizetési információ</p>
                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                              A fizetés készpénzben történik a szervizben a szolgáltatás igénybevételekor vagy a termék átvételekor.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2 border-t pt-6 mt-2">
                      <h2 className="text-xl font-semibold mb-4">Időpontfoglalás</h2>
                      <p className={`mb-4 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                        Ha szervizelést vagy beszerelést igénylő terméket rendelt, foglaljon időpontot az alábbi űrlapon.
                      </p>

                      <div className={`p-4 rounded-lg mb-6 ${darkMode ? "bg-[#252830]" : "bg-gray-100"}`}>
                        <label className="block mb-2 text-sm font-medium">Szerviz kiválasztása</label>
                        <div className="grid grid-cols-1 gap-3">
                          {garages.map(garage => (
                            <div
                              key={garage.id}
                              onClick={() => {
                                setAppointmentData(prev => ({
                                  ...prev,
                                  garageId: garage.id,
                                  date: "",
                                  time: ""
                                }));
                                setAvailableTimes([]);
                              }}
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
                                  {garage.contact_info && (
                                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                      <span className="inline-block mr-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                      </span>
                                      {garage.contact_info}
                                    </p>
                                  )}
                                  {garage.opening_hours && (
                                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                      <span className="inline-block mr-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                      </span>
                                      {garage.opening_hours}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

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
                              disabled={!appointmentData.garageId}
                            />

                            {!appointmentData.garageId && (
                              <p className={`mt-3 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Először válasszon szervizt
                              </p>
                            )}

                            {appointmentData.garageId && !appointmentData.date && (
                              <p className={`mt-3 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Válasszon egy dátumot az elérhető időpontok megtekintéséhez
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block mb-2 text-sm font-medium">Időpont kiválasztása</label>
                          <div className={`p-4 rounded-lg ${darkMode ? "bg-[#252830]" : "bg-gray-100"}`}>
                            {appointmentData.date ? (
                              loadingTimes ? (
                                <div className="flex justify-center py-4">
                                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4e77f4]"></div>
                                </div>
                              ) : (
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
                                      Kérjük válasszon másik napot vagy másik szervizt
                                    </p>
                                  </div>
                                )
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
      <Footer />
    </div>
  );
};

export default Checkout;