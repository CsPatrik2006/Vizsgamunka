import React, { useState } from "react";
import { Button } from "../ui/button";
import { Tooltip } from "../ui/tooltip";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BookingsView = ({
    darkMode,
    bookings,
    formatDate,
    getStatusBadgeClass,
    getStatusLabel,
    fetchBookings
}) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("date-desc"); // Default sort by date descending

    // Filter and sort bookings
    const filteredBookings = bookings.filter(booking => {
        // Status filter
        if (statusFilter !== "all" && booking.status !== statusFilter) {
            return false;
        }

        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                booking.id.toString().includes(searchLower) ||
                booking.user_id.toString().includes(searchLower) ||
                formatDate(booking.appointment_time).toLowerCase().includes(searchLower)
            );
        }

        return true;
    }).sort((a, b) => {
        // Sort logic
        switch (sortBy) {
            case "date-asc":
                return new Date(a.appointment_time) - new Date(b.appointment_time);
            case "date-desc":
                return new Date(b.appointment_time) - new Date(a.appointment_time);
            case "status":
                return a.status.localeCompare(b.status);
            case "id-asc":
                return a.id - b.id;
            case "id-desc":
                return b.id - a.id;
            default:
                return 0;
        }
    });

    const handleStatusChange = (booking, status) => {
        const token = localStorage.getItem("token");
        axios.put(
            `http://localhost:3000/appointments/${booking.id}`,
            { ...booking, status },
            { headers: { ...(token && { Authorization: `Bearer ${token}` }) } }
        ).then(() => fetchBookings());
    };

    return (
        <div className={`rounded-xl ${darkMode ? "bg-[#1e2129]" : "bg-white"} shadow-lg overflow-hidden`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">Foglalások</h2>

                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search input */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Keresés..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg border ${darkMode
                                ? "bg-[#252830] border-[#3a3f4b] text-white"
                                : "bg-white border-gray-300 text-black"
                                } focus:ring-2 focus:ring-[#4e77f4] outline-none`}
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Status filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={`px-3 py-2 rounded-lg border ${darkMode
                            ? "bg-[#252830] border-[#3a3f4b] text-white"
                            : "bg-white border-gray-300 text-black"
                            } focus:ring-2 focus:ring-[#4e77f4] outline-none`}
                    >
                        <option value="all">Minden állapot</option>
                        <option value="pending">Függőben</option>
                        <option value="confirmed">Megerősítve</option>
                    </select>

                    {/* Sort options */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className={`px-3 py-2 rounded-lg border ${darkMode
                            ? "bg-[#252830] border-[#3a3f4b] text-white"
                            : "bg-white border-gray-300 text-black"
                            } focus:ring-2 focus:ring-[#4e77f4] outline-none`}
                    >
                        <option value="date-desc">Legújabb elöl</option>
                        <option value="date-asc">Legrégebbi elöl</option>
                        <option value="status">Állapot szerint</option>
                        <option value="id-asc">Azonosító (növekvő)</option>
                        <option value="id-desc">Azonosító (csökkenő)</option>
                    </select>
                </div>
            </div>

            {filteredBookings.length === 0 ? (
                <div className="p-6 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-[#88a0e8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xl text-[#88a0e8]">
                        {searchTerm || statusFilter !== "all"
                            ? "Nincs találat a keresési feltételeknek megfelelően"
                            : "Nincsenek foglalások"}
                    </p>
                    {(searchTerm || statusFilter !== "all") && (
                        <Button
                            onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("all");
                            }}
                            className="mt-4 bg-[#4e77f4]"
                        >
                            Szűrők törlése
                        </Button>
                    )}
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
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Műveletek</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredBookings.map((booking) => (
                                <tr key={booking.id} className={`${darkMode ? "hover:bg-[#252830]" : "hover:bg-gray-50"} transition-colors`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.user_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(booking.appointment_time)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(booking.status)}`}>
                                            {getStatusLabel(booking.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex flex-wrap gap-2">
                                            <Tooltip content="Rendelés megtekintése">
                                                <Button
                                                    onClick={() => navigate(`/my-garages/${booking.garage_id}/orders`)}
                                                    className="text-xs py-1 px-2 bg-[#4e77f4] hover:bg-[#3a5fd0] flex items-center gap-1"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                                    </svg>
                                                    Rendelés
                                                </Button>
                                            </Tooltip>

                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium">Állapot:</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {[
                                                        { value: 'pending', label: 'Függőben', color: 'bg-yellow-500' },
                                                        { value: 'confirmed', label: 'Megerősítve', color: 'bg-blue-500' }
                                                    ].map(status => (
                                                        <button
                                                            key={status.value}
                                                            onClick={() => handleStatusChange(booking, status.value)}
                                                            className={`px-2 py-1 text-xs rounded-md flex items-center gap-1 transition-colors
                                                                ${booking.status === status.value
                                                                    ? (darkMode ? 'bg-gray-700 ring-2 ring-blue-500' : 'bg-blue-100 ring-2 ring-blue-500')
                                                                    : (darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200')}`}
                                                        >
                                                            <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
                                                            {status.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <Tooltip content="Foglalás törlése">
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
                                                    className="text-xs py-1 px-2 bg-red-600 hover:bg-red-700 flex items-center gap-1"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    Törlés
                                                </Button>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Összesen: {filteredBookings.length} foglalás
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                            <span className="text-xs">Függőben</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                            <span className="text-xs">Megerősítve</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingsView;