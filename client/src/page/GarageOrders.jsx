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
import Footer from "../components/ui/Footer";

const GarageOrdersPage = ({ isLoggedIn, userData, handleLogout }) => {
    const { garageId } = useParams();
    const navigate = useNavigate();
    const { darkMode, themeLoaded } = useTheme();
    const { handleCartLogout } = useCart();

    // State management
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [itemsLoading, setItemsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Check if user is authorized and fetch orders
    useEffect(() => {
        if (!userData || userData.role !== "garage_owner") {
            navigate("/");
            return;
        }

        fetchOrders();
    }, [userData, navigate, garageId]);

    // API calls
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            console.log(`Fetching orders for garage ID: ${garageId}`);

            const response = await axios.get(`http://localhost:3000/orders/garage/${garageId}`, {
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` })
                }
            });

            console.log("Orders response:", response.data);
            setOrders(response.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching orders:", err);

            // More detailed error message
            let errorMessage = "Hiba történt a rendelések betöltése közben";

            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                errorMessage += `: ${err.response.status} - ${err.response.data?.message || err.message}`;
                console.error("Error response data:", err.response.data);
            } else if (err.request) {
                // The request was made but no response was received
                errorMessage += ": Nincs válasz a szervertől";
            } else {
                // Something happened in setting up the request that triggered an Error
                errorMessage += `: ${err.message}`;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderItems = async (orderId) => {
        try {
            setItemsLoading(true);
            const token = localStorage.getItem("token");

            console.log(`Fetching order items for order ID: ${orderId}`);

            const response = await axios.get(`http://localhost:3000/orderItems/order/${orderId}`, {
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` })
                }
            });

            console.log("Order items response:", response.data);
            setOrderItems(response.data);
        } catch (err) {
            console.error("Error fetching order items:", err);

            // We don't set a global error here, but we could show a local error in the UI
            let errorMessage = "Hiba történt a rendelési tételek betöltése közben";

            if (err.response) {
                errorMessage += `: ${err.response.status} - ${err.response.data?.message || err.message}`;
                console.error("Error response data:", err.response.data);
            } else if (err.request) {
                errorMessage += ": Nincs válasz a szervertől";
            } else {
                errorMessage += `: ${err.message}`;
            }

            // You could add a local error state for order items if needed
            // setOrderItemsError(errorMessage);
        } finally {
            setItemsLoading(false);
        }
    };

    // Update order status
    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem("token");
            const order = orders.find(o => o.id === orderId);

            if (!order) return;

            console.log(`Updating order ${orderId} status to: ${newStatus}`);

            // Show confirmation dialog for cancellation
            if (newStatus === 'canceled') {
                if (!window.confirm("Biztosan törölni szeretné ezt a rendelést? A készlet visszakerül a raktárba.")) {
                    return;
                }
            }

            const response = await axios.put(`http://localhost:3000/orders/${orderId}`, {
                user_id: order.user_id,
                garage_id: order.garage_id,
                total_price: order.total_price,
                status: newStatus
            }, {
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` })
                }
            });

            // Update the local state
            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));

            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }

            // Show success message for cancellation
            if (newStatus === 'canceled') {
                alert("A rendelés sikeresen törölve lett, és a készlet visszakerült a raktárba.");
            }

        } catch (err) {
            console.error("Error updating order status:", err);

            let errorMessage = "Hiba történt a rendelés állapotának frissítése közben";

            if (err.response) {
                errorMessage += `: ${err.response.status} - ${err.response.data?.message || err.message}`;
                console.error("Error response data:", err.response.data);
            } else if (err.request) {
                errorMessage += ": Nincs válasz a szervertől";
            } else {
                errorMessage += `: ${err.message}`;
            }

            // Show error notification
            alert(errorMessage);
        }
    };

    // Event handlers
    const handleOrderSelect = async (order) => {
        if (selectedOrder && selectedOrder.id === order.id) {
            // Toggle selection off
            setSelectedOrder(null);
            setOrderItems([]);
            return;
        }

        setSelectedOrder(order);
        fetchOrderItems(order.id);
    };

    const handleStatusUpdate = (orderId, newStatus) => {
        updateOrderStatus(orderId, newStatus);
    };

    const handleLogoutWithCartClear = () => {
        handleCartLogout();
        handleLogout();
    };

    // Helper functions
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('hu-HU', options);
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'pending':
                return darkMode ? 'bg-yellow-800/30 text-yellow-200' : 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return darkMode ? 'bg-blue-800/30 text-blue-200' : 'bg-blue-100 text-blue-800';
            case 'completed':
                return darkMode ? 'bg-green-800/30 text-green-200' : 'bg-green-100 text-green-800';
            case 'canceled':
                return darkMode ? 'bg-red-800/30 text-red-200' : 'bg-red-100 text-red-800';
            default:
                return darkMode ? 'bg-gray-800/30 text-gray-200' : 'bg-gray-100 text-gray-800';
        }
    };

    const translateStatus = (status) => {
        switch (status) {
            case 'pending':
                return 'Függőben';
            case 'confirmed':
                return 'Megerősítve';
            case 'completed':
                return 'Teljesítve';
            case 'canceled':
                return 'Törölve';
            default:
                return status;
        }
    };

    // UI Components
    const renderLoading = () => (
        <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4e77f4]"></div>
        </div>
    );

    // Add the missing renderEmptyState function
    const renderEmptyState = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`p-12 text-center rounded-xl ${darkMode ? "bg-[#1e2129]" : "bg-white"} shadow-lg`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-[#88a0e8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-xl text-[#88a0e8]">Még nincsenek rendelések ehhez a garázshoz.</p>
            <p className="mt-2 text-gray-500 dark:text-gray-400">A rendelések itt fognak megjelenni, amint az ügyfelek vásárolnak.</p>
        </motion.div>
    );

    // In the GarageOrders.jsx file, update the renderOrderItems function:
    const renderOrderItems = () => (
        itemsLoading ? (
            <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#4e77f4]"></div>
            </div>
        ) : orderItems.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className={darkMode ? "bg-[#2a3042]" : "bg-gray-100"}>
                        <tr>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                Típus
                            </th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                Termék név
                            </th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                Mennyiség
                            </th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                Egységár
                            </th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                Összesen
                            </th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                        {orderItems.map((item) => (
                            <tr key={item.id}>
                                <td className="px-4 py-2 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.product_type === "service"
                                        ? (darkMode ? "bg-purple-800/30 text-purple-200" : "bg-purple-100 text-purple-800")
                                        : (darkMode ? "bg-indigo-800/30 text-indigo-200" : "bg-indigo-100 text-indigo-800")
                                        }`}>
                                        {item.product_type === "service" ? "Szolgáltatás" : "Termék"}
                                    </span>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                    {item.product_name || `ID: ${item.product_id}`}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                    {item.quantity}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                    {Number(item.unit_price).toLocaleString("hu-HU")} Ft
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                                    {(Number(item.unit_price) * item.quantity).toLocaleString("hu-HU")} Ft
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <p className="text-center py-4">Nincsenek tételek ehhez a rendeléshez.</p>
        )
    );

    const renderOrderDetails = (order) => (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <h4 className="font-medium">Ügyfél információk</h4>
                <p className="text-sm">{order.User?.last_name || "Ismeretlen"}</p>
                <p className="text-sm">{order.User?.first_name || "Ismeretlen"}</p>
                <p className="text-sm">{order.User?.email || "Nincs email"}</p>
                <p className="text-sm">{order.User?.phone || "Nincs telefonszám"}</p>
            </div>

            <div>
                <h4 className="font-medium">Rendelés összegzés</h4>
                <p className="text-sm">Rendelés dátuma: {formatDate(order.order_date)}</p>
                <p className="text-sm">Állapot: {translateStatus(order.status)}</p>
                <p className="text-sm font-bold">Végösszeg: {Number(order.total_price).toLocaleString("hu-HU")} Ft</p>
            </div>
        </div>
    );

    const renderActionButtons = (order) => (
        <div className="flex space-x-2">
            {order.status === "pending" && (
                <>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(order.id, "confirmed");
                        }}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        Megerősítés
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(order.id, "canceled");
                        }}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                        Törlés
                    </button>
                </>
            )}
            {order.status === "confirmed" && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(order.id, "completed");
                    }}
                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                >
                    Teljesítés
                </button>
            )}
        </div>
    );

    const renderOrdersTable = () => (
        <div className={`rounded-xl overflow-hidden ${darkMode ? "bg-[#1e2129]" : "bg-white"} shadow-lg`}>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className={darkMode ? "bg-[#252830]" : "bg-gray-50"}>
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Rendelés ID
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Ügyfél
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Dátum
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Összeg
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Állapot
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Műveletek
                            </th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                        {orders.map((order) => (
                            <React.Fragment key={order.id}>
                                <tr
                                    className={`cursor-pointer ${selectedOrder && selectedOrder.id === order.id ? (darkMode ? "bg-[#2a3042]" : "bg-blue-50") : ""} ${darkMode ? "hover:bg-[#252830]" : "hover:bg-gray-50"}`}
                                    onClick={() => handleOrderSelect(order)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm">#{order.id}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium">{order.User?.last_name || "Ismeretlen"}</div>
                                        <div className="text-sm font-medium">{order.User?.first_name || "Ismeretlen"}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{order.User?.email || "Nincs email"}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm">{formatDate(order.order_date)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium">{Number(order.total_price).toLocaleString("hu-HU")} Ft</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                                            {translateStatus(order.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {renderActionButtons(order)}
                                    </td>
                                </tr>
                                {selectedOrder && selectedOrder.id === order.id && (
                                    <tr className={darkMode ? "bg-[#1e2129]" : "bg-gray-50"}>
                                        <td colSpan="6" className="px-6 py-4">
                                            <div className={`p-4 rounded-lg ${darkMode ? "bg-[#252830]" : "bg-white"} shadow-inner`}>
                                                <h3 className="text-lg font-medium mb-3">Rendelés részletei</h3>
                                                {renderOrderItems()}
                                                {renderOrderDetails(order)}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // Don't render until theme is loaded
    if (!themeLoaded) {
        return null;
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
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold">Rendelések</h1>
                        <Button onClick={() => navigate(`/my-garages`)}>
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

                    {loading ? renderLoading() :
                        orders.length === 0 ? renderEmptyState() :
                            renderOrdersTable()}
                </motion.div>
            </section>
            <Footer />
        </div>
    );
};

export default GarageOrdersPage;