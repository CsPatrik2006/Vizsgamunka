import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import { useCart } from '../context/CartContext';
import Header from "../components/ui/navbar";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import logo_light from '../assets/logo_lightMode.png';
import logo_dark from '../assets/logo_darkMode.png';
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { hu } from 'date-fns/locale';

const GarageAppointmentSchedulePage = ({ isLoggedIn, userData, handleLogout }) => {
    const { darkMode, themeLoaded } = useTheme();
    const { handleCartLogout } = useCart();
    const navigate = useNavigate();
    const { garageId } = useParams();
    const [garage, setGarage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [schedule, setSchedule] = useState({
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
    });
    const [selectedDay, setSelectedDay] = useState("monday");
    const [newTimeSlot, setNewTimeSlot] = useState({
        start_time: "08:00",
        end_time: "09:00",
        max_bookings: 1
    });
    const [bookings, setBookings] = useState([]);
    const [viewMode, setViewMode] = useState("schedule"); // "schedule", "bookings", or "week"
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [slotBookings, setSlotBookings] = useState([]);
    const [weeklyAvailableSlots, setWeeklyAvailableSlots] = useState({});

    useEffect(() => {
        // Scroll to top when component mounts
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (!userData || userData.role !== "garage_owner") {
            navigate("/");
            return;
        }

        fetchGarageDetails();
        fetchSchedule();
        fetchBookings();
    }, [userData, navigate, garageId]);

    // Fetch weekly available slots when currentDate changes
    useEffect(() => {
        if (viewMode === "week") {
            fetchWeeklyAvailableSlots();
        }
    }, [currentDate, viewMode]);

    const fetchGarageDetails = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`http://localhost:3000/garages/${garageId}`, {
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` })
                }
            });

            // Verify this garage belongs to the current user
            const userId = userData?.userId || userData?.id;
            if (response.data.owner_id.toString() !== userId.toString()) {
                setError("Nincs jogosultsága ehhez a garázshoz");
                navigate("/my-garages");
                return;
            }

            setGarage(response.data);
        } catch (err) {
            console.error("Error fetching garage details:", err);
            setError("Hiba történt a garázs adatainak betöltése közben");
        }
    };

    const fetchSchedule = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            // Get the garage's appointment schedule
            const response = await axios.get(`http://localhost:3000/garages/${garageId}/schedule`, {
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` })
                }
            });

            if (response.data) {
                setSchedule(response.data);
            }

            setLoading(false);
        } catch (err) {
            console.error("Error fetching schedule:", err);
            // If the schedule doesn't exist yet, we'll just use the default empty one
            setLoading(false);
        }
    };

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem("token");

            // Get all appointments for this garage
            const response = await axios.get('http://localhost:3000/appointments', {
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` })
                }
            });

            if (Array.isArray(response.data)) {
                const garageAppointments = response.data.filter(appointment =>
                    appointment.garage_id.toString() === garageId.toString()
                );

                // Sort appointments by date (newest first)
                garageAppointments.sort((a, b) =>
                    new Date(b.appointment_time) - new Date(a.appointment_time)
                );

                setBookings(garageAppointments);
            }
        } catch (err) {
            console.error("Error fetching bookings:", err);
        }
    };

    const fetchWeeklyAvailableSlots = async () => {
        try {
            const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
            const availableSlotsMap = {};

            // Fetch available slots for each day of the week
            for (let i = 0; i < 7; i++) {
                const date = addDays(weekStart, i);
                const formattedDate = format(date, 'yyyy-MM-dd');
                const availableSlots = await fetchAvailableSlotsForDate(date);
                availableSlotsMap[formattedDate] = availableSlots;
            }

            setWeeklyAvailableSlots(availableSlotsMap);
        } catch (err) {
            console.error("Error fetching weekly available slots:", err);
        }
    };

    const fetchAvailableSlotsForDate = async (date) => {
        try {
            const token = localStorage.getItem("token");
            const formattedDate = format(date, 'yyyy-MM-dd');

            const response = await axios.get(
                `http://localhost:3000/garages/${garageId}/available-slots?date=${formattedDate}`,
                {
                    headers: {
                        ...(token && { Authorization: `Bearer ${token}` })
                    }
                }
            );

            return response.data;
        } catch (err) {
            console.error("Error fetching available slots:", err);
            return [];
        }
    };

    const handleLogoutWithCartClear = () => {
        handleCartLogout();
        handleLogout();
    };

    const handleAddTimeSlot = async () => {
        try {
            // Validate time slot
            const startTime = new Date(`2000-01-01T${newTimeSlot.start_time}`);
            const endTime = new Date(`2000-01-01T${newTimeSlot.end_time}`);

            if (startTime >= endTime) {
                setError("A kezdő időpontnak korábbinak kell lennie, mint a záró időpontnak");
                return;
            }

            // Check for overlapping time slots
            const hasOverlap = schedule[selectedDay].some(slot => {
                const slotStart = new Date(`2000-01-01T${slot.start_time}`);
                const slotEnd = new Date(`2000-01-01T${slot.end_time}`);

                return (startTime < slotEnd && endTime > slotStart);
            });

            if (hasOverlap) {
                setError("Az időpontok nem fedhetik egymást");
                return;
            }

            // Add the new time slot
            const updatedSchedule = { ...schedule };
            updatedSchedule[selectedDay] = [
                ...updatedSchedule[selectedDay],
                { ...newTimeSlot }
            ];

            // Sort time slots by start time
            updatedSchedule[selectedDay].sort((a, b) => {
                const aTime = new Date(`2000-01-01T${a.start_time}`);
                const bTime = new Date(`2000-01-01T${b.start_time}`);
                return aTime - bTime;
            });

            // Save the updated schedule
            const token = localStorage.getItem("token");
            await axios.put(
                `http://localhost:3000/garages/${garageId}/schedule`,
                updatedSchedule,
                {
                    headers: {
                        ...(token && { Authorization: `Bearer ${token}` })
                    }
                }
            );

            setSchedule(updatedSchedule);
            setNewTimeSlot({
                start_time: "08:00",
                end_time: "09:00",
                max_bookings: 1
            });
            setError(null);
        } catch (err) {
            console.error("Error adding time slot:", err);
            setError("Hiba történt az időpont hozzáadása közben: " + (err.response?.data?.message || err.message));
        }
    };

    const handleRemoveTimeSlot = async (dayName, index) => {
        try {
            const updatedSchedule = { ...schedule };
            updatedSchedule[dayName] = updatedSchedule[dayName].filter((_, i) => i !== index);

            // Save the updated schedule
            const token = localStorage.getItem("token");
            await axios.put(
                `http://localhost:3000/garages/${garageId}/schedule`,
                updatedSchedule,
                {
                    headers: {
                        ...(token && { Authorization: `Bearer ${token}` })
                    }
                }
            );

            setSchedule(updatedSchedule);
        } catch (err) {
            console.error("Error removing time slot:", err);
            setError("Hiba történt az időpont törlése közben: " + (err.response?.data?.message || err.message));
        }
    };

    const handleCopySchedule = async (fromDay) => {
        try {
            if (fromDay === selectedDay) {
                setError("Nem másolhatja ugyanarra a napra a beosztást");
                return;
            }

            const updatedSchedule = { ...schedule };
            updatedSchedule[selectedDay] = [...schedule[fromDay]];

            // Save the updated schedule
            const token = localStorage.getItem("token");
            await axios.put(
                `http://localhost:3000/garages/${garageId}/schedule`,
                updatedSchedule,
                {
                    headers: {
                        ...(token && { Authorization: `Bearer ${token}` })
                    }
                }
            );

            setSchedule(updatedSchedule);
            setError(null);
        } catch (err) {
            console.error("Error copying schedule:", err);
            setError("Hiba történt a beosztás másolása közben: " + (err.response?.data?.message || err.message));
        }
    };

    const handleSlotClick = (day, time) => {
        // Find bookings for this time slot
        const dayStr = format(day, 'yyyy-MM-dd');
        const startTimeStr = `${dayStr}T${time}:00`;
        const [hours, minutes] = time.split(':');
        const endHour = parseInt(hours) + 1;
        const endTimeStr = `${dayStr}T${endHour.toString().padStart(2, '0')}:${minutes}:00`;

        const slotAppointments = bookings.filter(booking => {
            const bookingTime = new Date(booking.appointment_time);
            return bookingTime >= new Date(startTimeStr) && bookingTime < new Date(endTimeStr);
        });

        setSelectedSlot({ day, time });
        setSlotBookings(slotAppointments);
    };

    const generateWeekView = () => {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

        // Generate time slots from 8:00 to 18:00
        const timeSlots = [];
        for (let hour = 8; hour < 18; hour++) {
            timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
        }

        return { weekDays, timeSlots };
    };

    const isSlotAvailable = (day, time) => {
        const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][day.getDay()];
        const daySchedule = schedule[dayOfWeek] || [];

        // Check if this time is within any scheduled slot
        return daySchedule.some(slot => {
            const slotStart = slot.start_time.substring(0, 5); // HH:MM
            const slotEnd = slot.end_time.substring(0, 5); // HH:MM
            return time >= slotStart && time < slotEnd;
        });
    };

    const getBookingsForSlot = (day, time) => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const startTimeStr = `${dayStr}T${time}:00`;
        const [hours, minutes] = time.split(':');
        const endHour = parseInt(hours) + 1;
        const endTimeStr = `${dayStr}T${endHour.toString().padStart(2, '0')}:${minutes}:00`;

        return bookings.filter(booking => {
            const bookingTime = new Date(booking.appointment_time);
            return bookingTime >= new Date(startTimeStr) && bookingTime < new Date(endTimeStr);
        });
    };

    const getSlotBookingCount = (day, time) => {
        return getBookingsForSlot(day, time).length;
    };

    const getSlotMaxBookings = (day, time) => {
        const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][day.getDay()];
        const daySchedule = schedule[dayOfWeek] || [];

        // Find the slot that contains this time
        const slot = daySchedule.find(slot => {
            const slotStart = slot.start_time.substring(0, 5); // HH:MM
            const slotEnd = slot.end_time.substring(0, 5); // HH:MM
            return time >= slotStart && time < slotEnd;
        });

        return slot ? slot.max_bookings : 0;
    };

    const getDayLabel = (day) => {
        const dayLabels = {
            monday: "Hétfő",
            tuesday: "Kedd",
            wednesday: "Szerda",
            thursday: "Csütörtök",
            friday: "Péntek",
            saturday: "Szombat",
            sunday: "Vasárnap"
        };
        return dayLabels[day] || day;
    };

    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('hu-HU', options);
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'canceled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending': return 'Függőben';
            case 'confirmed': return 'Megerősítve';
            case 'completed': return 'Teljesítve';
            case 'canceled': return 'Lemondva';
            default: return status;
        }
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
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                        <div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigate('/my-garages')}
                                    className="text-[#4e77f4] hover:text-[#3a5fd0] transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                <h1 className="text-3xl font-bold">Időpontfoglalás kezelése</h1>
                            </div>
                            {garage && <p className="text-[#88a0e8] mt-1">{garage.name}</p>}
                        </div>

                        <div className="mt-4 md:mt-0 flex gap-3">
                            <Button
                                onClick={() => setViewMode("schedule")}
                                className={viewMode === "schedule" ? "bg-[#4e77f4]" : "bg-gray-600"}
                            >
                                Beosztás
                            </Button>
                            <Button
                                onClick={() => setViewMode("week")}
                                className={viewMode === "week" ? "bg-[#4e77f4]" : "bg-gray-600"}
                            >
                                Heti naptár
                            </Button>
                            <Button
                                onClick={() => setViewMode("bookings")}
                                className={viewMode === "bookings" ? "bg-[#4e77f4]" : "bg-gray-600"}
                            >
                                Foglalások
                            </Button>
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
                        >
                            {error}
                        </motion.div>
                    )}

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4e77f4]"></div>
                        </div>
                    ) : viewMode === "schedule" ? (
                        <div className={`rounded-xl ${darkMode ? "bg-[#1e2129]" : "bg-white"} shadow-lg p-6`}>
                            <div className="flex flex-wrap gap-3 mb-6">
                                {Object.keys(schedule).map(day => (
                                    <button
                                        key={day}
                                        onClick={() => setSelectedDay(day)}
                                        className={`px-4 py-2 rounded-lg transition-colors ${selectedDay === day
                                            ? "bg-[#4e77f4] text-white"
                                            : darkMode
                                                ? "bg-[#252830] hover:bg-[#2d3039]"
                                                : "bg-gray-100 hover:bg-gray-200"
                                            }`}
                                    >
                                        {getDayLabel(day)}
                                    </button>
                                ))}
                            </div>

                            <div className="mb-8">
                                <h2 className="text-xl font-semibold mb-4">{getDayLabel(selectedDay)} - Időpontok</h2>

                                {schedule[selectedDay].length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-400 italic">Nincsenek beállított időpontok erre a napra</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {schedule[selectedDay].map((slot, index) => (
                                            <div
                                                key={index}
                                                className={`p-4 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-200"}`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <span className="font-medium">{slot.start_time} - {slot.end_time}</span>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Max. foglalás: {slot.max_bookings}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveTimeSlot(selectedDay, index)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className={`p-6 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-200"} mb-6`}>
                                <h3 className="text-lg font-medium mb-4">Új időpont hozzáadása</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block mb-2 text-sm font-medium">Kezdő időpont</label>
                                        <input
                                            type="time"
                                            value={newTimeSlot.start_time}
                                            onChange={(e) => setNewTimeSlot({ ...newTimeSlot, start_time: e.target.value })}
                                            className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium">Záró időpont</label>
                                        <input
                                            type="time"
                                            value={newTimeSlot.end_time}
                                            onChange={(e) => setNewTimeSlot({ ...newTimeSlot, end_time: e.target.value })}
                                            className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium">Max. foglalás</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={newTimeSlot.max_bookings}
                                            onChange={(e) => setNewTimeSlot({ ...newTimeSlot, max_bookings: parseInt(e.target.value) })}
                                            className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Button onClick={handleAddTimeSlot}>
                                        Időpont hozzáadása
                                    </Button>
                                </div>
                            </div>

                            <div className={`p-6 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-200"}`}>
                                <h3 className="text-lg font-medium mb-4">Beosztás másolása másik napról</h3>
                                <div className="flex flex-wrap gap-3">
                                    {Object.keys(schedule).map(day => (
                                        day !== selectedDay && (
                                            <Button
                                                key={day}
                                                onClick={() => handleCopySchedule(day)}
                                                className="bg-gray-600 hover:bg-gray-700"
                                            >
                                                {getDayLabel(day)} beosztásának másolása
                                            </Button>
                                        )
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : viewMode === "week" ? (
                        // Weekly calendar view
                        <div className={`rounded-xl ${darkMode ? "bg-[#1e2129]" : "bg-white"} shadow-lg overflow-hidden`}>
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <Button
                                    onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))}
                                    className="bg-gray-600 hover:bg-gray-700"
                                >
                                    Előző hét
                                </Button>
                                <h2 className="text-xl font-semibold">
                                    {format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy. MMMM d.', { locale: hu })} -
                                    {format(addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), 6), ' MMMM d.', { locale: hu })}
                                </h2>
                                <Button
                                    onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))}
                                    className="bg-gray-600 hover:bg-gray-700"
                                >
                                    Következő hét
                                </Button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">
                                                Idő
                                            </th>
                                            {generateWeekView().weekDays.map((day) => (
                                                <th
                                                    key={day.toString()}
                                                    className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                                >
                                                    <div>{format(day, 'EEEE', { locale: hu })}</div>
                                                    <div className="font-bold text-sm text-gray-700 dark:text-gray-300">
                                                        {format(day, 'MM.dd')}
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                                        {generateWeekView().timeSlots.map((time) => (
                                            <tr key={time} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    {time}
                                                </td>
                                                {generateWeekView().weekDays.map((day) => {
                                                    const isAvailable = isSlotAvailable(day, time);
                                                    const bookingCount = getSlotBookingCount(day, time);
                                                    const maxBookings = getSlotMaxBookings(day, time);
                                                    const isFull = bookingCount >= maxBookings && maxBookings > 0;

                                                    return (
                                                        <td
                                                            key={day.toString() + time}
                                                            className={`px-4 py-2 whitespace-nowrap text-sm text-center cursor-pointer ${isAvailable
                                                                ? isFull
                                                                    ? 'bg-red-50 dark:bg-red-900/20'
                                                                    : 'bg-green-50 dark:bg-green-900/20'
                                                                : 'bg-gray-100 dark:bg-gray-800'
                                                                }`}
                                                            onClick={() => isAvailable && handleSlotClick(day, time)}
                                                        >
                                                            {isAvailable ? (
                                                                <div>
                                                                    <div className="font-medium">
                                                                        {bookingCount} / {maxBookings}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {isFull ? 'Betelt' : 'Szabad'}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400 dark:text-gray-600">-</span>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        // Bookings view
                        <div className={`rounded-xl ${darkMode ? "bg-[#1e2129]" : "bg-white"} shadow-lg overflow-hidden`}>
                            <h2 className="text-xl font-semibold p-6 border-b border-gray-200 dark:border-gray-700">Foglalások</h2>

                            {bookings.length === 0 ? (
                                <div className="p-6 text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-[#88a0e8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-xl text-[#88a0e8]">Nincsenek foglalások</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className={`${darkMode ? "bg-[#252830]" : "bg-gray-50"}`}>
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Azonosító</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Felhasználó</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Időpont</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Állapot</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Rendelés</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Műveletek</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {bookings.map((booking) => (
                                                <tr key={booking.id} className={`${darkMode ? "hover:bg-[#252830]" : "hover:bg-gray-50"} transition-colors`}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.id}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.user_id}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(booking.appointment_time)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(booking.status)}`}>
                                                            {getStatusLabel(booking.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <Button
                                                            onClick={() => navigate(`/orders/${booking.order_id}`)}
                                                            className="text-xs py-1 px-2"
                                                        >
                                                            Rendelés megtekintése
                                                        </Button>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <div className="flex space-x-2">
                                                            <div className="relative group">
                                                                <Button
                                                                    className="text-xs py-1 px-2 bg-gray-600 hover:bg-gray-700"
                                                                >
                                                                    Állapot
                                                                </Button>
                                                                <div className="absolute z-10 hidden group-hover:block mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden">
                                                                    <div className="py-1">
                                                                        <button
                                                                            onClick={() => {
                                                                                const token = localStorage.getItem("token");
                                                                                axios.put(
                                                                                    `http://localhost:3000/appointments/${booking.id}`,
                                                                                    { ...booking, status: 'pending' },
                                                                                    { headers: { ...(token && { Authorization: `Bearer ${token}` }) } }
                                                                                ).then(() => fetchBookings());
                                                                            }}
                                                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                                                        >
                                                                            Függőben
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                const token = localStorage.getItem("token");
                                                                                axios.put(
                                                                                    `http://localhost:3000/appointments/${booking.id}`,
                                                                                    { ...booking, status: 'confirmed' },
                                                                                    { headers: { ...(token && { Authorization: `Bearer ${token}` }) } }
                                                                                ).then(() => fetchBookings());
                                                                            }}
                                                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                                                        >
                                                                            Megerősítve
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                const token = localStorage.getItem("token");
                                                                                axios.put(
                                                                                    `http://localhost:3000/appointments/${booking.id}`,
                                                                                    { ...booking, status: 'completed' },
                                                                                    { headers: { ...(token && { Authorization: `Bearer ${token}` }) } }
                                                                                ).then(() => fetchBookings());
                                                                            }}
                                                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                                                        >
                                                                            Teljesítve
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                const token = localStorage.getItem("token");
                                                                                axios.put(
                                                                                    `http://localhost:3000/appointments/${booking.id}`,
                                                                                    { ...booking, status: 'canceled' },
                                                                                    { headers: { ...(token && { Authorization: `Bearer ${token}` }) } }
                                                                                ).then(() => fetchBookings());
                                                                            }}
                                                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                                                        >
                                                                            Lemondva
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <Button
                                                                onClick={() => {
                                                                    if (confirm("Biztosan törölni szeretné ezt a foglalást?")) {
                                                                        const token = localStorage.getItem("token");
                                                                        axios.delete(
                                                                            `http://localhost:3000/appointments/${booking.id}`,
                                                                            { headers: { ...(token && { Authorization: `Bearer ${token}` }) } }
                                                                        ).then(() => fetchBookings());
                                                                    }
                                                                }}
                                                                className="text-xs py-1 px-2 bg-red-600 hover:bg-red-700"
                                                            >
                                                                Törlés
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Modal for viewing bookings in a specific time slot */}
                    {selectedSlot && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className={`relative rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${darkMode ? "bg-[#1e2129]" : "bg-white"}`}>
                                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-xl font-semibold">
                                        Foglalások: {format(selectedSlot.day, 'yyyy. MM. dd.')} {selectedSlot.time}
                                    </h3>
                                </div>

                                <div className="p-6">
                                    {slotBookings.length === 0 ? (
                                        <p className="text-center text-gray-500 dark:text-gray-400">Nincsenek foglalások erre az időpontra</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {slotBookings.map((booking) => (
                                                <div
                                                    key={booking.id}
                                                    className={`p-4 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-200"}`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusBadgeClass(booking.status)}`}>
                                                                    {getStatusLabel(booking.status)}
                                                                </span>
                                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                                    ID: {booking.id}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm mb-1">
                                                                <span className="font-medium">Felhasználó:</span> {booking.user_id}
                                                            </p>
                                                            <p className="text-sm mb-1">
                                                                <span className="font-medium">Időpont:</span> {formatDate(booking.appointment_time)}
                                                            </p>
                                                            <p className="text-sm">
                                                                <span className="font-medium">Rendelés:</span> #{booking.order_id}
                                                            </p>
                                                        </div>

                                                        <div className="flex flex-col gap-2">
                                                            <Button
                                                                onClick={() => navigate(`/orders/${booking.order_id}`)}
                                                                className="text-xs py-1 px-2 whitespace-nowrap"
                                                            >
                                                                Rendelés
                                                            </Button>

                                                            <div className="relative group">
                                                                <Button
                                                                    className="text-xs py-1 px-2 bg-gray-600 hover:bg-gray-700 whitespace-nowrap"
                                                                >
                                                                    Állapot
                                                                </Button>
                                                                <div className="absolute z-10 right-0 hidden group-hover:block mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden">
                                                                    <div className="py-1">
                                                                        <button
                                                                            onClick={() => {
                                                                                const token = localStorage.getItem("token");
                                                                                axios.put(
                                                                                    `http://localhost:3000/appointments/${booking.id}`,
                                                                                    { ...booking, status: 'pending' },
                                                                                    { headers: { ...(token && { Authorization: `Bearer ${token}` }) } }
                                                                                ).then(() => {
                                                                                    fetchBookings();
                                                                                    // Update the slot bookings
                                                                                    const updatedBooking = { ...booking, status: 'pending' };
                                                                                    setSlotBookings(slotBookings.map(b =>
                                                                                        b.id === booking.id ? updatedBooking : b
                                                                                    ));
                                                                                });
                                                                            }}
                                                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                                                        >
                                                                            Függőben
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                const token = localStorage.getItem("token");
                                                                                axios.put(
                                                                                    `http://localhost:3000/appointments/${booking.id}`,
                                                                                    { ...booking, status: 'confirmed' },
                                                                                    { headers: { ...(token && { Authorization: `Bearer ${token}` }) } }
                                                                                ).then(() => {
                                                                                    fetchBookings();
                                                                                    // Update the slot bookings
                                                                                    const updatedBooking = { ...booking, status: 'confirmed' };
                                                                                    setSlotBookings(slotBookings.map(b =>
                                                                                        b.id === booking.id ? updatedBooking : b
                                                                                    ));
                                                                                });
                                                                            }}
                                                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                                                        >
                                                                            Megerősítve
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                const token = localStorage.getItem("token");
                                                                                axios.put(
                                                                                    `http://localhost:3000/appointments/${booking.id}`,
                                                                                    { ...booking, status: 'completed' },
                                                                                    { headers: { ...(token && { Authorization: `Bearer ${token}` }) } }
                                                                                ).then(() => {
                                                                                    fetchBookings();
                                                                                    // Update the slot bookings
                                                                                    const updatedBooking = { ...booking, status: 'completed' };
                                                                                    setSlotBookings(slotBookings.map(b =>
                                                                                        b.id === booking.id ? updatedBooking : b
                                                                                    ));
                                                                                });
                                                                            }}
                                                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                                                        >
                                                                            Teljesítve
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                const token = localStorage.getItem("token");
                                                                                axios.put(
                                                                                    `http://localhost:3000/appointments/${booking.id}`,
                                                                                    { ...booking, status: 'canceled' },
                                                                                    { headers: { ...(token && { Authorization: `Bearer ${token}` }) } }
                                                                                ).then(() => {
                                                                                    fetchBookings();
                                                                                    // Update the slot bookings
                                                                                    const updatedBooking = { ...booking, status: 'canceled' };
                                                                                    setSlotBookings(slotBookings.map(b =>
                                                                                        b.id === booking.id ? updatedBooking : b
                                                                                    ));
                                                                                });
                                                                            }}
                                                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                                                        >
                                                                            Lemondva
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <Button
                                                                onClick={() => {
                                                                    if (confirm("Biztosan törölni szeretné ezt a foglalást?")) {
                                                                        const token = localStorage.getItem("token");
                                                                        axios.delete(
                                                                            `http://localhost:3000/appointments/${booking.id}`,
                                                                            { headers: { ...(token && { Authorization: `Bearer ${token}` }) } }
                                                                        ).then(() => {
                                                                            fetchBookings();
                                                                            // Remove the booking from slot bookings
                                                                            setSlotBookings(slotBookings.filter(b => b.id !== booking.id));
                                                                        });
                                                                    }
                                                                }}
                                                                className="text-xs py-1 px-2 bg-red-600 hover:bg-red-700"
                                                            >
                                                                Törlés
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                                    <Button
                                        onClick={() => setSelectedSlot(null)}
                                        className="bg-gray-600 hover:bg-gray-700"
                                    >
                                        Bezárás
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </section>

            <footer className={`py-6 mt-12 ${darkMode ? "bg-[#070708] text-[#f9fafc]" : "bg-[#f9fafc] text-black"} text-center`}>
                <p className="text-sm">© 2025 Gumizz Kft. Minden jog fenntartva.</p>
                <div className="mt-2">
                    <a href="#" className="text-sm text-[#4e77f4] hover:text-[#5570c2]">Adatvédelem</a> |
                    <a href="#" className="text-sm text-[#4e77f4] hover:text-[#5570c2]"> Általános Szerződési Feltételek</a>
                </div>
            </footer>
        </div>
    );
};

export default GarageAppointmentSchedulePage;