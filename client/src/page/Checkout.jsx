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

      // 1. Create an order
      const orderResponse = await axios.post('http://localhost:3000/orders', {
        user_id: userId,
        order_date: new Date().toISOString(),
        total_amount: cartItems.reduce((total, item) => total + (item.price * item.quantity), 0),
        status: 'pending'
      });

      const orderId = orderResponse.data.id;

      // 2. Create order items
      await Promise.all(cartItems.map(item =>
        axios.post('http://localhost:3000/orderItems', {
          order_id: orderId,
          product_type: item.product_type,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.price
        })
      ));

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
      setError('Failed to process your order. Please try again.');
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
                        <p className="font-bold">{item.price} Ft</p>
                        <p className="text-sm">{item.price * item.quantity} Ft</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={`pt-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                  <div className="flex justify-between mb-2">
                    <span>Részösszeg:</span>
                    <span>{totalAmount} Ft</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Szállítási díj:</span>
                    <span>0 Ft</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg mt-2">
                    <span>Összesen:</span>
                    <span>{totalAmount} Ft</span>
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

                    <div className="md:col-span-2 border-t pt-6 mt-2">
                      <h2 className="text-xl font-semibold mb-4">Időpontfoglalás</h2>
                      <p className={`mb-4 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                        Ha szervizelést vagy beszerelést igénylő terméket rendelt, foglaljon időpontot az alábbi űrlapon.
                      </p>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">Szerviz kiválasztása</label>
                      <select
                        name="garageId"
                        value={appointmentData.garageId}
                        onChange={handleAppointmentChange}
                        className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                      >
                        {garages.map(garage => (
                          <option key={garage.id} value={garage.id}>
                            {garage.name} - {garage.location}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">Dátum</label>
                      <input
                        type="date"
                        name="date"
                        min={today}
                        value={appointmentData.date}
                        onChange={handleAppointmentChange}
                        className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">Időpont</label>
                      <select
                        name="time"
                        value={appointmentData.time}
                        onChange={handleAppointmentChange}
                        disabled={!appointmentData.date || availableTimes.length === 0}
                        className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all ${!appointmentData.date ? "opacity-50" : ""}`}
                      >
                        <option value="">Válassz időpontot</option>
                        {availableTimes.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      {appointmentData.date && availableTimes.length === 0 && (
                        <p className="mt-1 text-sm text-red-500">Nincs elérhető időpont ezen a napon</p>
                      )}
                    </div>

                    <div className="md:col-span-2 mt-4">
                      <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"} mb-2`}>
                        Az időpontfoglalás opcionális. Ha nem választ időpontot, a rendelés feldolgozása után felvesszük Önnel a kapcsolatot.
                      </p>
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