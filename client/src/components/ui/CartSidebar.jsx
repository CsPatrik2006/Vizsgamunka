import React, { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { Button } from "./button";

const CartSidebar = ({ isOpen, onClose, cartItems = [] }) => {
  const { darkMode } = useTheme();
  const { removeFromCart, updateCartItemQuantity } = useCart();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [animationClass, setAnimationClass] = useState("translate-x-full");
  const [inventoryLimits, setInventoryLimits] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Format price with thousand separator
  const formatPrice = (price) => {
    return new Intl.NumberFormat('hu-HU').format(price);
  };

  // Handle animation mounting
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // Small delay to ensure DOM is ready before animation starts
      setTimeout(() => {
        setAnimationClass("translate-x-0");
      }, 10);

      // Fetch inventory limits when cart opens
      fetchInventoryLimits();
    } else {
      setAnimationClass("translate-x-full");
      const timer = setTimeout(() => {
        setMounted(false);
      }, 300); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Fetch inventory limits for all items in cart
  const fetchInventoryLimits = async () => {
    const inventoryItems = cartItems.filter(item => item.product_type === 'inventory');

    if (inventoryItems.length === 0) return;

    setIsLoading(true);
    try {
      const limits = {};

      for (const item of inventoryItems) {
        const response = await axios.get(`http://localhost:3000/inventory/${item.product_id}`);
        limits[item.product_id] = response.data.quantity;
      }

      setInventoryLimits(limits);
    } catch (error) {
      console.error('Error fetching inventory limits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle item removal
  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  // Handle quantity change
  const handleQuantityChange = async (item, change) => {
    const newQuantity = item.quantity + change;

    // Don't allow quantity below 1
    if (newQuantity < 1) return;

    // For inventory items, check against inventory limits
    if (item.product_type === 'inventory') {
      const limit = inventoryLimits[item.product_id] || 0;

      if (newQuantity > limit) {
        alert(`Csak ${limit} darab áll rendelkezésre ebből a termékből.`);
        return;
      }
    }

    // Update quantity
    await updateCartItemQuantity(item.id, newQuantity);
  };

  // Handle checkout
  const handleCheckout = () => {
    onClose(); // Close the cart sidebar
    navigate('/checkout'); // Navigate to the checkout page
  };

  // Don't render anything if not mounted
  if (!mounted && !isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${isOpen ? "opacity-50" : "opacity-0 pointer-events-none"
          }`}
        onClick={onClose}
      />

      {/* Cart Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 z-50 transform transition-transform duration-300 ease-in-out ${animationClass} 
        ${darkMode ? "bg-[#252830] text-white" : "bg-white text-gray-800"} shadow-xl`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`p-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"} flex justify-between items-center`}>
            <h2 className="text-xl font-semibold">Kosár</h2>
            <Button onClick={onClose} className={darkMode ? "text-white" : "text-black"}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-grow overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-400 mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
                <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}>A kosár üres</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                          {item.product_type === "service" ? "Szolgáltatás" : "Termék"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatPrice(item.price)} Ft</p>
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center">
                        <button
                          className={`w-7 h-7 flex items-center justify-center rounded-full ${darkMode ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-200 hover:bg-gray-300"}`}
                          onClick={() => handleQuantityChange(item, -1)}
                          disabled={isLoading}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                          </svg>
                        </button>
                        <span className="mx-2">{item.quantity}</span>
                        <button
                          className={`w-7 h-7 flex items-center justify-center rounded-full ${darkMode ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-200 hover:bg-gray-300"}`}
                          onClick={() => handleQuantityChange(item, 1)}
                          disabled={isLoading || (item.product_type === 'inventory' && item.quantity >= (inventoryLimits[item.product_id] || 0))}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                        </button>
                      </div>
                      <p className="font-medium">{formatPrice(item.price * item.quantity)} Ft</p>
                    </div>

                    {/* Inventory limit warning */}
                    {item.product_type === 'inventory' &&
                      inventoryLimits[item.product_id] !== undefined &&
                      item.quantity >= inventoryLimits[item.product_id] && (
                        <p className="text-xs text-amber-500 mt-1">
                          Elérte a maximális készletet ({inventoryLimits[item.product_id]} db)
                        </p>
                      )}

                    <button
                      className="text-red-500 text-sm mt-2 cursor-pointer"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      Eltávolítás
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`p-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
            <div className="flex justify-between mb-4">
              <span className="font-medium">Összesen:</span>
              <span className="font-bold">
                {formatPrice(cartItems.reduce((total, item) => total + (item.price * item.quantity), 0))} Ft
              </span>
            </div>
            <button
              className={`w-full py-2 rounded-lg ${cartItems.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#4e77f4] hover:bg-[#3a5fc7]"
                } text-white font-medium transition-colors cursor-pointer`}
              disabled={cartItems.length === 0 || isLoading}
              onClick={handleCheckout}
            >
              Tovább a fizetéshez
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartSidebar;