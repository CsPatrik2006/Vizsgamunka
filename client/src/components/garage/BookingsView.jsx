import React from "react";
import { Button } from "../ui/button";
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

  return (
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
  );
};

export default BookingsView;
