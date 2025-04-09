import React from "react";
import { Button } from "./button";
import { motion } from "framer-motion";
import { useTheme } from '../../context/ThemeContext';

const ProductCard = ({
    item,
    garage,
    onAddToCart,
    onClick,
    isLoggedIn,
    setIsLoginOpen
}) => {
    const { darkMode } = useTheme();

    // Helper functions
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

    // Handle add to cart with login check
    const handleAddToCart = (e) => {
        e.stopPropagation(); // Prevent event bubbling

        if (!isLoggedIn) {
            // Prompt user to login
            setIsLoginOpen(true);
            return;
        }

        // Call the provided onAddToCart function
        onAddToCart(e, item);
    };

    return (
        <motion.div
            onClick={onClick}
            className={`rounded-lg shadow-md overflow-hidden ${darkMode ? "bg-[#252830]" : "bg-white"} hover:shadow-lg transition-all duration-300 hover:scale-105 transform`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ 
                y: -5,
                boxShadow: darkMode 
                    ? "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)"
                    : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
        >
            <div className="h-48 bg-gray-700 relative overflow-hidden">
                {item.cover_img ? (
                    <img
                        src={getImageUrl(item.cover_img)}
                        alt={item.item_name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        onError={(e) => {
                            e.target.onerror = null
                            e.target.src = "https://placehold.co/400x300/gray/white?text=No+Image"
                        }}
                    />
                ) : (
                    <div className="text-center p-4 h-full flex flex-col items-center justify-center">
                        <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">Nincs kép</p>
                    </div>
                )}
                {/* Vehicle type badge */}
                <div className="absolute top-2 right-2 bg-[#4e77f4] text-white text-xs px-2 py-1 rounded-full">
                    {getVehicleTypeDisplayName(item.vehicle_type)}
                </div>

                {/* Season badge */}
                {item.season && (
                    <div className={`absolute top-2 left-2 text-xs px-2 py-1 rounded-full ${item.season === 'winter'
                            ? 'bg-blue-500 text-white'
                            : item.season === 'summer'
                                ? 'bg-yellow-500 text-black'
                                : 'bg-green-500 text-white'
                        }`}>
                        {getSeasonDisplayName(item.season)}
                    </div>
                )}

                {/* Multiple images indicator */}
                {(item.additional_img1 || item.additional_img2) && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {item.additional_img1 && item.additional_img2 ? '+2' : '+1'}
                        </div>
                    </div>
                )}
            </div>
            <div className="p-4 cursor-pointer">
                <h3 className="text-lg font-semibold mb-1">{item.item_name}</h3>
                <p className="text-[#88a0e8] text-sm mb-2">
                    {garage?.name || 'Ismeretlen szervíz'}
                </p>

                {/* Tyre size display */}
                {item.width && item.profile && item.diameter && (
                    <p className="text-sm mb-2 font-medium">
                        Méret: <span className="font-bold">{item.width}/{item.profile}R{item.diameter}</span>
                    </p>
                )}

                <p className="text-xl font-bold mb-3">{formatPrice(item.unit_price)} Ft</p>
                <div className="flex justify-between items-center">
                    <span className={`text-sm ${item.quantity > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {item.quantity > 0 ? `Készleten: ${item.quantity} db` : 'Nincs készleten'}
                    </span>
                    <Button
                        className="bg-[#4e77f4] hover:bg-[#5570c2] text-white px-3 py-2 rounded-lg transition-transform hover:scale-105"
                        disabled={item.quantity <= 0}
                        onClick={handleAddToCart}
                    >
                        Kosárba
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;