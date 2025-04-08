import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import { useCart } from '../context/CartContext';
import Header from "../components/ui/navbar";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import logo_light from '../assets/logo_lightMode.png';
import logo_dark from '../assets/logo_darkMode.png';
import Footer from "../components/ui/Footer";

const EditGaragePage = ({ isLoggedIn, userData, handleLogout }) => {
    const { darkMode, themeLoaded } = useTheme();
    const { handleCartLogout } = useCart();
    const navigate = useNavigate();
    const { garageId } = useParams();
    const [searchQuery, setSearchQuery] = useState("");
    const isDeletedRef = useRef(false); // Use ref to track deletion state across renders

    const [garageData, setGarageData] = useState({
        name: "",
        location: "",
        description: "",
        contact_info: "",
        opening_hours: ""
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle logout with cart clear
    const handleLogoutWithCartClear = () => {
        handleCartLogout();
        handleLogout();
    };

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Check if user is authorized and fetch garage data
    useEffect(() => {
        if (!userData || userData.role !== "garage_owner") {
            navigate("/");
            return;
        }

        const fetchGarageData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                const response = await axios.get(`http://localhost:3000/garages/${garageId}`, {
                    headers: {
                        ...(token && { Authorization: `Bearer ${token}` })
                    }
                });

                // Check if the garage belongs to the current user
                const userId = userData?.userId || userData?.id;
                if (response.data.owner_id.toString() !== userId.toString()) {
                    setError("Nincs jogosultsága ennek a garázsnak a szerkesztéséhez.");
                    navigate("/my-garages");
                    return;
                }

                setGarageData({
                    name: response.data.name || "",
                    location: response.data.location || "",
                    description: response.data.description || "",
                    contact_info: response.data.contact_info || "",
                    opening_hours: response.data.opening_hours || ""
                });
                setLoading(false);
            } catch (err) {
                console.error("Error fetching garage data:", err);
                setError("Hiba történt a garázs adatainak betöltése közben.");
                setLoading(false);
            }
        };

        fetchGarageData();
    }, [garageId, userData, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setGarageData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Don't submit if the garage has been deleted
        if (isDeletedRef.current) {
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const token = localStorage.getItem("token");
            const userId = userData?.userId || userData?.id;

            if (!userId) {
                setError("Felhasználói azonosító hiányzik. Kérjük, jelentkezzen be újra.");
                setIsSubmitting(false);
                return;
            }

            await axios.put(
                `http://localhost:3000/garages/${garageId}`,
                {
                    ...garageData,
                    owner_id: userId
                },
                {
                    headers: {
                        ...(token && { Authorization: `Bearer ${token}` })
                    }
                }
            );

            setSuccess("A garázs adatai sikeresen frissítve!");
            setTimeout(() => {
                navigate("/my-garages");
            }, 2000);
        } catch (err) {
            setError("Hiba történt a garázs adatainak frissítése közben: " +
                (err.response?.data?.message || err.message));
            console.error(err);
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        // Ask for confirmation
        if (!window.confirm("Biztosan törölni szeretné ezt a garázst? Ez a művelet nem visszavonható!")) {
            // User cancelled - just return without showing any messages or redirecting
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null); // Clear any existing errors
            const token = localStorage.getItem("token");

            await axios.delete(`http://localhost:3000/garages/${garageId}`, {
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` })
                }
            });

            // Mark the garage as deleted to prevent further operations
            isDeletedRef.current = true;

            // Set success message
            setSuccess("A garázs sikeresen törölve!");

            // Redirect after a short delay to show the success message
            setTimeout(() => {
                navigate("/my-garages");
            }, 1500);
        } catch (err) {
            console.error("Error deleting garage:", err);
            setError("Hiba történt a garázs törlése közben: " +
                (err.response?.data?.message || err.message));

            // Don't redirect if there's an error
            setIsSubmitting(false);
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

            <section className="max-w-4xl mx-auto py-12 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold">Garázs szerkesztése</h1>
                        <Button onClick={() => navigate("/my-garages")} variant="outline">
                            Vissza a garázsokhoz
                        </Button>
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

                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6"
                        >
                            {success}
                        </motion.div>
                    )}

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4e77f4]"></div>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.3 }}
                            className={`p-6 rounded-xl ${darkMode ? "bg-[#1e2129]" : "bg-white"} shadow-lg`}
                        >
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block mb-2 text-sm font-medium">Név</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={garageData.name}
                                            onChange={handleInputChange}
                                            className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                                            required
                                            disabled={isSubmitting || isDeletedRef.current}
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium">Helyszín</label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={garageData.location}
                                            onChange={handleInputChange}
                                            className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                                            required
                                            disabled={isSubmitting || isDeletedRef.current}
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium">Kapcsolattartási információ</label>
                                        <input
                                            type="text"
                                            name="contact_info"
                                            value={garageData.contact_info}
                                            onChange={handleInputChange}
                                            className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                                            placeholder="Telefonszám vagy email"
                                            disabled={isSubmitting || isDeletedRef.current}
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium">Nyitvatartás</label>
                                        <input
                                            type="text"
                                            name="opening_hours"
                                            value={garageData.opening_hours}
                                            onChange={handleInputChange}
                                            className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                                            placeholder="pl. H-P: 8:00-17:00, Szo: 9:00-13:00"
                                            disabled={isSubmitting || isDeletedRef.current}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block mb-2 text-sm font-medium">Leírás</label>
                                        <textarea
                                            name="description"
                                            value={garageData.description}
                                            onChange={handleInputChange}
                                            className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                                            rows="4"
                                            placeholder="Írja le a garázs szolgáltatásait, specialitásait..."
                                            disabled={isSubmitting || isDeletedRef.current}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-between">
                                    <Button
                                        type="button"
                                        onClick={handleDelete}
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                        disabled={isSubmitting || isDeletedRef.current}
                                    >
                                        {isSubmitting ? "Feldolgozás..." : "Garázs törlése"}
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || isDeletedRef.current}
                                    >
                                        {isSubmitting ? "Mentés..." : "Változtatások mentése"}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </motion.div>
            </section>
        <Footer />
        </div>
    );
};

export default EditGaragePage;