import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import { useCart } from '../context/CartContext';
import { motion } from "framer-motion";
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';
import Header from "../components/ui/navbar";
import { Button } from "../components/ui/button";
import { Tooltip } from "../components/ui/tooltip";
import ScheduleView from "../components/garage/ScheduleView";
import WeeklyCalendarView from "../components/garage/WeeklyCalendarView";
import BookingsView from "../components/garage/BookingsView";
import SlotBookingsModal from "../components/garage/SlotBookingsModal";
import logo_light from '../assets/logo_lightMode.png';
import logo_dark from '../assets/logo_darkMode.png';
import Footer from "../components/ui/Footer";

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
                // Format the time values to ensure consistent HH:mm format
                const formattedSchedule = {};
                Object.keys(response.data).forEach(day => {
                    formattedSchedule[day] = response.data[day].map(slot => ({
                        ...slot,
                        start_time: typeof slot.start_time === 'string'
                            ? slot.start_time.substring(0, 5) // Take only HH:mm part
                            : format(new Date(slot.start_time), "HH:mm"),
                        end_time: typeof slot.end_time === 'string'
                            ? slot.end_time.substring(0, 5) // Take only HH:mm part
                            : format(new Date(slot.end_time), "HH:mm")
                    }));
                });
                setSchedule(formattedSchedule);
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
                                <Tooltip content="Vissza a garázsokhoz">
                                    <button
                                        onClick={() => navigate('/my-garages')}
                                        className="text-[#4e77f4] hover:text-[#3a5fd0] transition-colors cursor-pointer"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </Tooltip>
                                <h1 className="text-3xl font-bold">Időpontfoglalás kezelése</h1>
                            </div>
                            {garage && <p className="text-[#88a0e8] mt-1">{garage.name}</p>}
                        </div>

                        <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
                            <Tooltip content="Beosztás beállítása">
                                <Button
                                    onClick={() => setViewMode("schedule")}
                                    className={`flex items-center gap-1 ${viewMode === "schedule" ? "bg-[#4e77f4]" : "bg-gray-600"}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                    <span className="hidden sm:inline">Beosztás</span>
                                </Button>
                            </Tooltip>
                            <Tooltip content="Heti naptár nézet">
                                <Button
                                    onClick={() => setViewMode("week")}
                                    className={`flex items-center gap-1 ${viewMode === "week" ? "bg-[#4e77f4]" : "bg-gray-600"}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                    <span className="hidden sm:inline">Heti naptár</span>
                                </Button>
                            </Tooltip>
                            <Tooltip content="Foglalások listája">
                                <Button
                                    onClick={() => setViewMode("bookings")}
                                    className={`flex items-center gap-1 ${viewMode === "bookings" ? "bg-[#4e77f4]" : "bg-gray-600"}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                    </svg>
                                    <span className="hidden sm:inline">Foglalások</span>
                                </Button>
                            </Tooltip>
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                            <button
                                onClick={() => setError(null)}
                                className="ml-auto text-red-700 hover:text-red-900"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </motion.div>
                    )}

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4e77f4] mb-4"></div>
                            <p className="text-[#4e77f4]">Adatok betöltése...</p>
                        </div>
                    ) : viewMode === "schedule" ? (
                        <ScheduleView
                            darkMode={darkMode}
                            schedule={schedule}
                            selectedDay={selectedDay}
                            setSelectedDay={setSelectedDay}
                            newTimeSlot={newTimeSlot}
                            setNewTimeSlot={setNewTimeSlot}
                            handleAddTimeSlot={handleAddTimeSlot}
                            handleRemoveTimeSlot={handleRemoveTimeSlot}
                            handleCopySchedule={handleCopySchedule}
                            getDayLabel={getDayLabel}
                        />
                    ) : viewMode === "week" ? (
                        <WeeklyCalendarView
                            darkMode={darkMode}
                            currentDate={currentDate}
                            setCurrentDate={setCurrentDate}
                            generateWeekView={generateWeekView}
                            isSlotAvailable={isSlotAvailable}
                            getSlotBookingCount={getSlotBookingCount}
                            getSlotMaxBookings={getSlotMaxBookings}
                            handleSlotClick={handleSlotClick}
                        />
                    ) : (
                        <BookingsView
                            darkMode={darkMode}
                            bookings={bookings}
                            formatDate={formatDate}
                            getStatusBadgeClass={getStatusBadgeClass}
                            getStatusLabel={getStatusLabel}
                            fetchBookings={fetchBookings}
                        />
                    )}

                    {/* Modal for viewing bookings in a specific time slot */}
                    <SlotBookingsModal
                        darkMode={darkMode}
                        selectedSlot={selectedSlot}
                        setSelectedSlot={setSelectedSlot}
                        slotBookings={slotBookings}
                        setSlotBookings={setSlotBookings}
                        formatDate={formatDate}
                        getStatusBadgeClass={getStatusBadgeClass}
                        getStatusLabel={getStatusLabel}
                        fetchBookings={fetchBookings}
                    />
                </motion.div>
            </section>
            <Footer />
        </div>
    );
};

export default GarageAppointmentSchedulePage;