import React, { useState } from "react";
import { Button } from "../ui/button";
import { format, addDays, startOfWeek, isToday } from 'date-fns';
import { hu } from 'date-fns/locale';

const WeeklyCalendarView = ({
    darkMode,
    currentDate,
    setCurrentDate,
    generateWeekView,
    isSlotAvailable,
    getSlotBookingCount,
    getSlotMaxBookings,
    handleSlotClick
}) => {
    const { weekDays, timeSlots } = generateWeekView();
    const [selectedDay, setSelectedDay] = useState(null);

    const getSlotColor = (isAvailable, bookingCount, maxBookings) => {
        if (!isAvailable) return darkMode ? "bg-gray-800" : "bg-gray-100";

        const ratio = bookingCount / maxBookings;

        if (ratio >= 1) return darkMode ? "bg-red-900/30 border-red-800" : "bg-red-50 border-red-200";
        if (ratio >= 0.75) return darkMode ? "bg-orange-900/30 border-orange-800" : "bg-orange-50 border-orange-200";
        if (ratio >= 0.5) return darkMode ? "bg-yellow-900/30 border-yellow-800" : "bg-yellow-50 border-yellow-200";
        return darkMode ? "bg-green-900/30 border-green-800" : "bg-green-50 border-green-200";
    };

    const getTooltipContent = (isAvailable, bookingCount, maxBookings) => {
        return isAvailable
            ? `${bookingCount}/${maxBookings} foglalás${bookingCount >= maxBookings ? ' - Betelt' : ''}`
            : 'Nincs elérhető időpont';
    };

    return (
        <div className={`rounded-xl ${darkMode ? "bg-[#1e2129]" : "bg-white"} shadow-lg overflow-hidden`}>
            <div className={`p-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"} flex justify-between items-center`}>
                <Button
                    onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))}
                    className="bg-gray-600 hover:bg-gray-700"
                    title="Előző hét megtekintése"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="hidden sm:inline">Előző hét</span>
                </Button>

                <h2 className={`text-xl font-semibold text-center ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy. MMMM d.', { locale: hu })} -
                    {format(addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), 6), ' MMMM d.', { locale: hu })}
                </h2>

                <Button
                    onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))}
                    className="bg-gray-600 hover:bg-gray-700"
                    title="Következő hét megtekintése"
                >
                    <span className="hidden sm:inline">Következő hét</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                </Button>
            </div>

            <div className={`md:hidden p-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-white" : "text-gray-700"}`}>Válasszon napot:</label>
                <select
                    className={`w-full p-2 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b] text-white" : "bg-white border-gray-300 text-black"}`}
                    value={selectedDay ? selectedDay.toString() : weekDays[0].toString()}
                    onChange={(e) => setSelectedDay(new Date(e.target.value))}
                >
                    {weekDays.map((day) => (
                        <option key={day.toString()} value={day.toString()}>
                            {format(day, 'EEEE, yyyy. MM. dd.', { locale: hu })}
                        </option>
                    ))}
                </select>
            </div>

            <div className="hidden md:block overflow-x-auto">
                <table className={`min-w-full divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                    <thead>
                        <tr>
                            <th className={`px-4 py-3 ${darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-50 text-gray-500"} text-left text-xs font-medium uppercase tracking-wider w-20 sticky left-0 z-10`}>
                                Idő
                            </th>
                            {weekDays.map((day) => (
                                <th
                                    key={day.toString()}
                                    className={`px-4 py-3 ${darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-50 text-gray-500"} text-center text-xs font-medium uppercase tracking-wider`}
                                >
                                    <div>{format(day, 'EEEE', { locale: hu })}</div>
                                    <div className={`font-bold text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                        {format(day, 'MM.dd')}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className={`${darkMode ? "bg-gray-900" : "bg-white"} divide-y ${darkMode ? "divide-gray-800" : "divide-gray-200"}`}>
                        {timeSlots.map((time) => (
                            <tr key={time} className={`${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"}`}>
                                <td className={`px-4 py-2 whitespace-nowrap text-sm font-medium ${darkMode ? "text-white bg-gray-900" : "text-gray-900 bg-white"} sticky left-0 z-10 border-r ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                                    {time}
                                </td>
                                {weekDays.map((day) => {
                                    const isAvailable = isSlotAvailable(day, time);
                                    const bookingCount = getSlotBookingCount(day, time);
                                    const maxBookings = getSlotMaxBookings(day, time);
                                    const isFull = bookingCount >= maxBookings && maxBookings > 0;
                                    const slotColor = getSlotColor(isAvailable, bookingCount, maxBookings);
                                    const tooltipContent = getTooltipContent(isAvailable, bookingCount, maxBookings);

                                    return (
                                        <td
                                            key={day.toString() + time}
                                            className={`px-4 py-2 whitespace-nowrap text-sm text-center cursor-pointer border ${isAvailable ? slotColor : darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'} hover:opacity-80 transition-opacity`}
                                            onClick={() => isAvailable && handleSlotClick(day, time)}
                                            title={tooltipContent}
                                        >
                                            {isAvailable ? (
                                                <div>
                                                    <div className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                                                        {bookingCount} / {maxBookings}
                                                    </div>
                                                    <div className={`text-xs ${isFull
                                                        ? darkMode ? 'text-red-400 font-semibold' : 'text-red-600 font-semibold'
                                                        : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        {isFull ? 'Betelt' : 'Szabad'}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className={darkMode ? "text-gray-600" : "text-gray-400"}>-</span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="md:hidden overflow-x-auto">
                <table className={`min-w-full divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                    <thead>
                        <tr>
                            <th className={`px-4 py-3 ${darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-50 text-gray-500"} text-left text-xs font-medium uppercase tracking-wider w-20`}>
                                Idő
                            </th>
                            <th className={`px-4 py-3 ${darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-50 text-gray-500"} text-center text-xs font-medium uppercase tracking-wider`}>
                                Foglalások
                            </th>
                            <th className={`px-4 py-3 ${darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-50 text-gray-500"} text-center text-xs font-medium uppercase tracking-wider`}>
                                Állapot
                            </th>
                        </tr>
                    </thead>
                    <tbody className={`${darkMode ? "bg-gray-900" : "bg-white"} divide-y ${darkMode ? "divide-gray-800" : "divide-gray-200"}`}>
                        {timeSlots.map((time) => {
                            const day = selectedDay || weekDays[0];
                            const isAvailable = isSlotAvailable(day, time);
                            const bookingCount = getSlotBookingCount(day, time);
                            const maxBookings = getSlotMaxBookings(day, time);
                            const isFull = bookingCount >= maxBookings && maxBookings > 0;
                            const slotColor = getSlotColor(isAvailable, bookingCount, maxBookings);

                            return (
                                <tr
                                    key={time}
                                    className={`${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"} ${isAvailable ? 'cursor-pointer' : ''}`}
                                    onClick={() => isAvailable && handleSlotClick(day, time)}
                                >
                                    <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                                        {time}
                                    </td>
                                    <td className={`px-4 py-3 whitespace-nowrap text-sm text-center ${isAvailable ? slotColor : darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                        {isAvailable ? `${bookingCount} / ${maxBookings}` : '-'}
                                    </td>
                                    <td className={`px-4 py-3 whitespace-nowrap text-sm text-center ${isAvailable ? slotColor : darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                        {isAvailable ? (
                                            <span className={isFull
                                                ? darkMode ? 'text-red-400 font-semibold' : 'text-red-600 font-semibold'
                                                : darkMode ? 'text-green-400' : 'text-green-600'}>
                                                {isFull ? 'Betelt' : 'Szabad'}
                                            </span>
                                        ) : (
                                            <span className={darkMode ? "text-gray-600" : "text-gray-400"}>-</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className={`p-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                <div className="flex flex-wrap gap-2 justify-center">
                    <div className="flex items-center">
                        <div className={`w-4 h-4 rounded mr-1 border ${darkMode ? "bg-green-900/30 border-green-800" : "bg-green-50 border-green-200"}`}></div>
                        <span className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-700"}`}>0-50%</span>
                    </div>
                    <div className="flex items-center">
                        <div className={`w-4 h-4 rounded mr-1 border ${darkMode ? "bg-yellow-900/30 border-yellow-800" : "bg-yellow-50 border-yellow-200"}`}></div>
                        <span className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-700"}`}>50-75%</span>
                    </div>
                    <div className="flex items-center">
                        <div className={`w-4 h-4 rounded mr-1 border ${darkMode ? "bg-orange-900/30 border-orange-800" : "bg-orange-50 border-orange-200"}`}></div>
                        <span className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-700"}`}>75-99%</span>
                    </div>
                    <div className="flex items-center">
                        <div className={`w-4 h-4 rounded mr-1 border ${darkMode ? "bg-red-900/30 border-red-800" : "bg-red-50 border-red-200"}`}></div>
                        <span className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Betelt</span>
                    </div>
                    <div className="flex items-center">
                        <div className={`w-4 h-4 rounded mr-1 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-200"}`}></div>
                        <span className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Nincs időpont</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeeklyCalendarView;