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

const EditInventoryItemPage = ({ isLoggedIn, userData, handleLogout }) => {
    const { darkMode, themeLoaded } = useTheme();
    const { handleCartLogout } = useCart();
    const navigate = useNavigate();
    const { garageId, itemId } = useParams();
    const [searchQuery, setSearchQuery] = useState("");
    const isDeletedRef = useRef(false);
    const fileInputRef = useRef(null);
    const additionalImg1Ref = useRef(null);
    const additionalImg2Ref = useRef(null);

    const [itemData, setItemData] = useState({
        item_name: "",
        vehicle_type: "car",
        quantity: 0,
        unit_price: "",
        description: "",
        season: "",
        width: "",
        profile: "",
        diameter: ""
    });

    const [coverImage, setCoverImage] = useState(null);
    const [additionalImage1, setAdditionalImage1] = useState(null);
    const [additionalImage2, setAdditionalImage2] = useState(null);
    const [currentCoverImage, setCurrentCoverImage] = useState(null);
    const [currentAdditionalImage1, setCurrentAdditionalImage1] = useState(null);
    const [currentAdditionalImage2, setCurrentAdditionalImage2] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [currentDragTarget, setCurrentDragTarget] = useState(null);
    const [removeAdditionalImg1, setRemoveAdditionalImg1] = useState(false);
    const [removeAdditionalImg2, setRemoveAdditionalImg2] = useState(false);

    // Handle logout with cart clear
    const handleLogoutWithCartClear = () => {
        handleCartLogout();
        handleLogout();
    };

    // Helper function to get image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;

        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }

        return `http://localhost:3000${imagePath}`;
    };

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Check if user is authorized and fetch item data
    useEffect(() => {
        // Don't fetch data if the item has been deleted
        if (isDeletedRef.current) {
            return;
        }

        if (!userData || userData.role !== "garage_owner") {
            navigate("/");
            return;
        }

        const fetchItemData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");

                // First, check if the garage belongs to the user
                const garageResponse = await axios.get(`http://localhost:3000/garages/${garageId}`, {
                    headers: {
                        ...(token && { Authorization: `Bearer ${token}` })
                    }
                });

                const userId = userData?.userId || userData?.id;
                if (garageResponse.data.owner_id.toString() !== userId.toString()) {
                    setError("Nincs jogosultsága ennek a garázsnak a kezeléséhez.");
                    navigate("/my-garages");
                    return;
                }

                // Then fetch the inventory item
                const itemResponse = await axios.get(`http://localhost:3000/inventory/${itemId}`, {
                    headers: {
                        ...(token && { Authorization: `Bearer ${token}` })
                    }
                });

                // Check if the item belongs to the garage
                if (itemResponse.data.garage_id.toString() !== garageId.toString()) {
                    setError("Ez a termék nem ehhez a garázshoz tartozik.");
                    navigate(`/my-garages/${garageId}/inventory`);
                    return;
                }

                setItemData({
                    item_name: itemResponse.data.item_name || "",
                    vehicle_type: itemResponse.data.vehicle_type || "car",
                    quantity: itemResponse.data.quantity || 0,
                    unit_price: itemResponse.data.unit_price || "",
                    description: itemResponse.data.description || "",
                    season: itemResponse.data.season || "",
                    width: itemResponse.data.width || "",
                    profile: itemResponse.data.profile || "",
                    diameter: itemResponse.data.diameter || ""
                });

                if (itemResponse.data.cover_img) {
                    setCurrentCoverImage(getImageUrl(itemResponse.data.cover_img));
                }
                if (itemResponse.data.additional_img1) {
                    setCurrentAdditionalImage1(getImageUrl(itemResponse.data.additional_img1));
                }
                if (itemResponse.data.additional_img2) {
                    setCurrentAdditionalImage2(getImageUrl(itemResponse.data.additional_img2));
                }

                setLoading(false);
            } catch (err) {
                console.error("Error fetching item data:", err);
                setError("Hiba történt a termék adatainak betöltése közben.");
                setLoading(false);
            }
        };

        fetchItemData();
    }, [garageId, itemId, userData, navigate]);

    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file') {
            if (files && files[0]) {
                if (name === 'cover_img') {
                    setCoverImage(files[0]);
                } else if (name === 'additional_img1') {
                    setAdditionalImage1(files[0]);
                    setRemoveAdditionalImg1(false);
                } else if (name === 'additional_img2') {
                    setAdditionalImage2(files[0]);
                    setRemoveAdditionalImg2(false);
                }
            }
        } else {
            setItemData(prev => ({
                ...prev,
                [name]: name === "unit_price" || name === "quantity" || name === "width" || name === "profile" || name === "diameter"
                    ? value === "" ? "" : parseFloat(value)
                    : value
            }));
        }
    };

    // Add drag and drop event handlers
    const handleDragEnter = (e, target) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        setCurrentDragTarget(target);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Check if we're leaving to a child element - if so, don't reset the dragging state
        const relatedTarget = e.relatedTarget;
        if (relatedTarget && e.currentTarget.contains(relatedTarget)) {
            return;
        }

        setIsDragging(false);
        setCurrentDragTarget(null);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e, target) => {
        e.preventDefault();
        e.stopPropagation();

        setIsDragging(false);
        setCurrentDragTarget(null);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            // Check if the file is an image
            if (file.type.match('image.*')) {
                if (target === 'cover_img') {
                    setCoverImage(file);
                } else if (target === 'additional_img1') {
                    setAdditionalImage1(file);
                    setRemoveAdditionalImg1(false);
                } else if (target === 'additional_img2') {
                    setAdditionalImage2(file);
                    setRemoveAdditionalImg2(false);
                }
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Don't submit if the item has been deleted
        if (isDeletedRef.current) {
            return;
        }

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const token = localStorage.getItem("token");

            const formData = new FormData();
            formData.append('garage_id', parseInt(garageId));
            formData.append('item_name', itemData.item_name);
            formData.append('vehicle_type', itemData.vehicle_type);
            formData.append('quantity', itemData.quantity);
            formData.append('unit_price', itemData.unit_price);
            formData.append('description', itemData.description);

            // Add tyre-specific fields
            if (itemData.season) formData.append('season', itemData.season);
            if (itemData.width !== "") formData.append('width', itemData.width);
            if (itemData.profile !== "") formData.append('profile', itemData.profile);
            if (itemData.diameter !== "") formData.append('diameter', itemData.diameter);

            // Add images
            if (coverImage) {
                formData.append('cover_img', coverImage);
            }
            if (additionalImage1) {
                formData.append('additional_img1', additionalImage1);
            }
            if (additionalImage2) {
                formData.append('additional_img2', additionalImage2);
            }

            // Handle image removal flags
            if (removeAdditionalImg1) {
                formData.append('remove_additional_img1', 'true');
            }
            if (removeAdditionalImg2) {
                formData.append('remove_additional_img2', 'true');
            }

            await axios.put(
                `http://localhost:3000/inventory/${itemId}`,
                formData,
                {
                    headers: {
                        ...(token && { Authorization: `Bearer ${token}` }),
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            setSuccess("A termék adatai sikeresen frissítve!");
            setTimeout(() => {
                navigate(`/my-garages/${garageId}/inventory`);
            }, 2000);
        } catch (err) {
            setError("Hiba történt a termék adatainak frissítése közben: " +
                (err.response?.data?.message || err.message));
            console.error(err);
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        // Ask for confirmation
        if (!window.confirm("Biztosan törölni szeretné ezt a terméket? Ez a művelet nem visszavonható!")) {
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);
            const token = localStorage.getItem("token");

            await axios.delete(`http://localhost:3000/inventory/${itemId}`, {
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` })
                }
            });

            // Mark the item as deleted to prevent further operations
            isDeletedRef.current = true;

            setSuccess("A termék sikeresen törölve!");

            // Immediately navigate away to prevent further API calls to the deleted item
            setTimeout(() => {
                navigate(`/my-garages/${garageId}/inventory`);
            }, 1500);

        } catch (err) {
            console.error("Error deleting item:", err);
            setError("Hiba történt a termék törlése közben: " +
                (err.response?.data?.message || err.message));
            setIsSubmitting(false);
        }
    };

    const getVehicleTypeLabel = (type) => {
        switch (type) {
            case 'car': return 'Személygépkocsi';
            case 'motorcycle': return 'Motor';
            case 'truck': return 'Teherautó';
            default: return type;
        }
    };

    // Helper function to render image upload area
    const renderImageUpload = (imageType, image, setImage, currentImage, label, removeImage, setRemoveImage) => {
        return (
            <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">{label}</label>
                <div
                    className={`border-2 border-dashed rounded-lg p-4 transition-all 
                    ${isDragging && currentDragTarget === imageType ? "border-[#4e77f4] bg-blue-50" : ""} 
                    ${darkMode
                            ? `${isDragging && currentDragTarget === imageType ? "bg-[#1e2129] border-[#4e77f4]" : "border-[#3a3f4b] bg-[#252830]"}`
                            : `${isDragging && currentDragTarget === imageType ? "bg-blue-50 border-[#4e77f4]" : "border-gray-300 bg-gray-50"}`} 
                    hover:border-[#4e77f4]`}
                    onDragEnter={(e) => handleDragEnter(e, imageType)}
                    onDragOver={(e) => handleDragOver(e)}
                    onDragLeave={(e) => handleDragLeave(e)}
                    onDrop={(e) => handleDrop(e, imageType)}
                >
                    <div className="flex flex-col items-center justify-center">
                        {image ? (
                            <div className="w-full">
                                <div className="flex items-center justify-center mb-4">
                                    <img
                                        src={URL.createObjectURL(image)}
                                        alt="Preview"
                                        className="h-40 object-contain rounded-md"
                                    />
                                </div>
                                <p className="text-sm text-center mb-2 text-green-500">
                                    <span className="font-medium">{image.name}</span> ({(image.size / 1024).toFixed(1)} KB)
                                </p>
                                <div className="flex justify-center">
                                    <button
                                        type="button"
                                        onClick={() => setImage(null)}
                                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                                        disabled={isSubmitting || isDeletedRef.current}
                                    >
                                        Kép eltávolítása
                                    </button>
                                </div>
                            </div>
                        ) : currentImage && !removeImage ? (
                            <div className="w-full">
                                <div className="flex items-center justify-center mb-4">
                                    <img
                                        src={currentImage}
                                        alt="Current"
                                        className="h-40 object-contain rounded-md"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://placehold.co/400x300/gray/white?text=No+Image";
                                        }}
                                    />
                                </div>
                                <p className="text-sm text-center mb-2">
                                    Jelenlegi kép
                                </p>
                                <div className="flex justify-center">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (imageType === 'cover_img') {
                                                fileInputRef.current.click();
                                            } else if (imageType === 'additional_img1') {
                                                additionalImg1Ref.current.click();
                                            } else if (imageType === 'additional_img2') {
                                                additionalImg2Ref.current.click();
                                            }
                                        }}
                                        className="text-xs text-blue-500 hover:text-blue-700 font-medium mr-4"
                                        disabled={isSubmitting || isDeletedRef.current}
                                    >
                                        Kép cseréje
                                    </button>
                                    {imageType !== 'cover_img' && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (imageType === 'additional_img1') {
                                                    setRemoveAdditionalImg1(true);
                                                } else if (imageType === 'additional_img2') {
                                                    setRemoveAdditionalImg2(true);
                                                }
                                            }}
                                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                                            disabled={isSubmitting || isDeletedRef.current}
                                        >
                                            Kép eltávolítása
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <>
                                <svg
                                    className={`w-10 h-10 mb-3 ${isDragging && currentDragTarget === imageType ? "text-[#4e77f4]" : darkMode ? "text-gray-400" : "text-gray-500"}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    ></path>
                                </svg>
                                <p className={`mb-2 text-sm ${isDragging && currentDragTarget === imageType ? "text-[#4e77f4] font-medium" : darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                    {isDragging && currentDragTarget === imageType
                                        ? <span className="font-semibold">Engedd el a fájlt a feltöltéshez</span>
                                        : <span><span className="font-semibold">Kattints a feltöltéshez</span> vagy húzd ide a fájlt</span>
                                    }
                                </p>
                                <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                                    PNG, JPG vagy WEBP (Max. 5MB)
                                </p>
                            </>
                        )}
                        <input
                            type="file"
                            name={imageType}
                            id={`file-upload-${imageType}`}
                            ref={imageType === 'cover_img' ? fileInputRef : imageType === 'additional_img1' ? additionalImg1Ref : additionalImg2Ref}
                            className="hidden"
                            onChange={handleInputChange}
                            accept="image/*"
                            disabled={isSubmitting || isDeletedRef.current}
                        />
                        {!image && !currentImage && (
                            <label
                                htmlFor={`file-upload-${imageType}`}
                                className="mt-4 px-4 py-2 bg-[#4e77f4] text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-[#5570c2] transition-colors"
                            >
                                Kép kiválasztása
                            </label>
                        )}
                    </div>
                </div>
            </div>
        );
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
                        <div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate(`/my-garages/${garageId}/inventory`)}
                                className="text-[#88a0e8] mb-2 flex items-center font-medium cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                                Vissza a készlethez
                            </motion.button>
                            <h1 className="text-3xl font-bold">Termék szerkesztése</h1>
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
                                        <label className="block mb-2 text-sm font-medium">Termék neve</label>
                                        <input
                                            type="text"
                                            name="item_name"
                                            value={itemData.item_name}
                                            onChange={handleInputChange}
                                            className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                                            required
                                            disabled={isSubmitting || isDeletedRef.current}
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium">Jármű típus</label>
                                        <select
                                            name="vehicle_type"
                                            value={itemData.vehicle_type}
                                            onChange={handleInputChange}
                                            className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                                            required
                                            disabled={isSubmitting || isDeletedRef.current}
                                        >
                                            <option value="car">Személygépkocsi</option>
                                            <option value="motorcycle">Motor</option>
                                            <option value="truck">Teherautó</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium">Mennyiség</label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            value={itemData.quantity}
                                            onChange={handleInputChange}
                                            className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                                            min="0"
                                            required
                                            disabled={isSubmitting || isDeletedRef.current}
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium">Egységár (Ft)</label>
                                        <input
                                            type="number"
                                            name="unit_price"
                                            value={itemData.unit_price}
                                            onChange={handleInputChange}
                                            className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                                            min="0"
                                            step="0.01"
                                            required
                                            disabled={isSubmitting || isDeletedRef.current}
                                        />
                                    </div>

                                    {/* Tyre-specific fields */}
                                    <div>
                                        <label className="block mb-2 text-sm font-medium">Évszak</label>
                                        <select
                                            name="season"
                                            value={itemData.season}
                                            onChange={handleInputChange}
                                            className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                                            disabled={isSubmitting || isDeletedRef.current}
                                        >
                                            <option value="">Válassz évszakot</option>
                                            <option value="winter">Téli</option>
                                            <option value="summer">Nyári</option>
                                            <option value="all_season">Négyévszakos</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-sm font-medium">Szélesség (mm)</label>
                                        <input
                                            type="number"
                                            name="width"
                                            value={itemData.width}
                                            onChange={handleInputChange}
                                            className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                                            min="0"
                                            disabled={isSubmitting || isDeletedRef.current}
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-sm font-medium">Profil (%)</label>
                                        <input
                                            type="number"
                                            name="profile"
                                            value={itemData.profile}
                                            onChange={handleInputChange}
                                            className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                                            min="0"
                                            disabled={isSubmitting || isDeletedRef.current}
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-sm font-medium">Átmérő (col)</label>
                                        <input
                                            type="number"
                                            name="diameter"
                                            value={itemData.diameter}
                                            onChange={handleInputChange}
                                            className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                                            min="0"
                                            disabled={isSubmitting || isDeletedRef.current}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block mb-2 text-sm font-medium">Termék leírása</label>
                                        <textarea
                                            name="description"
                                            value={itemData.description}
                                            onChange={handleInputChange}
                                            rows="4"
                                            className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                                            placeholder="Adjon meg részletes leírást a termékről..."
                                            disabled={isSubmitting || isDeletedRef.current}
                                        ></textarea>
                                    </div>

                                    {/* Image upload sections */}
                                    <div className="md:col-span-2">
                                        {renderImageUpload('cover_img', coverImage, setCoverImage, currentCoverImage, 'Borítókép (kötelező)', false, null)}
                                    </div>

                                    <div className="md:col-span-1">
                                        {renderImageUpload('additional_img1', additionalImage1, setAdditionalImage1, currentAdditionalImage1, 'További kép 1', removeAdditionalImg1, setRemoveAdditionalImg1)}
                                    </div>

                                    <div className="md:col-span-1">
                                        {renderImageUpload('additional_img2', additionalImage2, setAdditionalImage2, currentAdditionalImage2, 'További kép 2', removeAdditionalImg2, setRemoveAdditionalImg2)}
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-between">
                                    <Button
                                        type="button"
                                        onClick={handleDelete}
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                        disabled={isSubmitting || isDeletedRef.current}
                                    >
                                        {isSubmitting ? "Feldolgozás..." : "Termék törlése"}
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

export default EditInventoryItemPage;