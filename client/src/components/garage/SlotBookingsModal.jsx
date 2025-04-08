import React from "react";
import { Button } from "../ui/button";
import { Tooltip } from "../ui/tooltip";
import { format } from 'date-fns';
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Regular booking item component (no reschedule feature)
const BookingItem = ({ booking, formatDate, getStatusBadgeClass, getStatusLabel, navigate, darkMode, onStatusChange, onDelete }) => {
    return (
        <div className={`p-4 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-200"} hover:shadow-md transition-shadow`}>
            <div className="flex flex-col gap-4">
                {/* Top section with status and ID */}
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusBadgeClass(booking.status)}`}>
                        {getStatusLabel(booking.status)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {booking.id}
                    </span>
                </div>
                
                {/* Main content section */}
                <div className="flex justify-between items-start">
                    {/* Left side - booking details */}
                    <div>
                        <p className="text-sm mb-1">
                            <span className="font-medium">Felhasználó:</span> {booking.user_id}
                        </p>
                        <p className="text-sm mb-1">
                            <span className="font-medium">Időpont:</span> {formatDate(booking.appointment_time)}
                        </p>
                        <p className="text-sm mb-3">
                            <span className="font-medium">Rendelés:</span> #{booking.order_id}
                        </p>
                        
                        {/* Action buttons - now on the left side */}
                        <div className="flex gap-2">
                            <Tooltip content="Rendelés megtekintése">
                                <Button
                                    onClick={() => navigate(`/my-garages/${booking.garage_id}/orders`)}
                                    className="text-xs py-1 px-2 whitespace-nowrap bg-[#4e77f4] hover:bg-[#3a5fd0] flex items-center gap-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                    </svg>
                                    Rendelés
                                </Button>
                            </Tooltip>
                            
                            <Tooltip content="Foglalás törlése">
                                <Button
                                    onClick={() => onDelete(booking.id)}
                                    className="text-xs py-1 px-2 bg-red-600 hover:bg-red-700 flex items-center gap-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    Törlés
                                </Button>
                            </Tooltip>
                        </div>
                    </div>
                    
                    {/* Right side - status selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">Állapot:</span>
                        <div className="flex flex-wrap gap-1">
                            {[
                                { value: 'pending', label: 'Függőben', color: 'bg-yellow-500' },
                                { value: 'confirmed', label: 'Megerősítve', color: 'bg-blue-500' }
                            ].map(status => (
                                <button
                                    key={status.value}
                                    onClick={() => onStatusChange(booking, status.value)}
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
                </div>
            </div>
        </div>
    );
};

const SlotBookingsModal = ({
    darkMode,
    selectedSlot,
    setSelectedSlot,
    slotBookings,
    setSlotBookings,
    formatDate,
    getStatusBadgeClass,
    getStatusLabel,
    fetchBookings
}) => {
    const navigate = useNavigate();

    if (!selectedSlot) return null;

    const handleStatusChange = (booking, status) => {
        const token = localStorage.getItem("token");
        axios.put(
            `http://localhost:3000/appointments/${booking.id}`,
            { ...booking, status },
            { headers: { ...(token && { Authorization: `Bearer ${token}` }) } }
        ).then(() => {
            fetchBookings();
            // Update the slot bookings
            const updatedBooking = { ...booking, status };
            setSlotBookings(slotBookings.map(b =>
                b.id === booking.id ? updatedBooking : b
            ));
        });
    };

    const handleDelete = (bookingId) => {
        if (confirm("Biztosan törölni szeretné ezt a foglalást?")) {
            const token = localStorage.getItem("token");
            axios.delete(
                `http://localhost:3000/appointments/${bookingId}`,
                { headers: { ...(token && { Authorization: `Bearer ${token}` }) } }
            ).then(() => {
                fetchBookings();
                // Remove the booking from slot bookings
                setSlotBookings(slotBookings.filter(b => b.id !== bookingId));
            });
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)' }}>
            <div className={`relative rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${darkMode ? "bg-[#1e2129]" : "bg-white"}`}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold">
                        Foglalások: {format(selectedSlot.day, 'yyyy. MM. dd.')} {selectedSlot.time}
                    </h3>
                </div>

                <div className="p-6">
                    {slotBookings.length === 0 ? (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p>Nincsenek foglalások erre az időpontra</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {slotBookings.map((booking) => (
                                <BookingItem
                                    key={booking.id}
                                    booking={booking}
                                    formatDate={formatDate}
                                    getStatusBadgeClass={getStatusBadgeClass}
                                    getStatusLabel={getStatusLabel}
                                    navigate={navigate}
                                    darkMode={darkMode}
                                    onStatusChange={handleStatusChange}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end items-center">
                    <Button
                        onClick={() => setSelectedSlot(null)}
                        className="bg-gray-600 hover:bg-gray-700"
                    >
                        Bezárás
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SlotBookingsModal;