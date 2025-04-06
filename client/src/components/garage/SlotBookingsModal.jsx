import React from "react";
import { Button } from "../ui/button";
import { format } from 'date-fns';
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

  return (
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
                            {['pending', 'confirmed', 'completed', 'canceled'].map(status => (
                              <button
                                key={status}
                                onClick={() => {
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
                                }}
                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                              >
                                {getStatusLabel(status)}
                              </button>
                            ))}
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
  );
};

export default SlotBookingsModal;
