import React from "react";
import { Button } from "../ui/button";
import { format, addDays, startOfWeek } from 'date-fns';
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

  return (
    <div className={`rounded-xl ${darkMode ? "bg-[#1e2129]" : "bg-white"} shadow-lg overflow-hidden`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <Button
          onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))}
          className="bg-gray-600 hover:bg-gray-700"
        >
          Előző hét
        </Button>
        <h2 className="text-xl font-semibold">
          {format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy. MMMM d.', { locale: hu })} -
          {format(addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), 6), ' MMMM d.', { locale: hu })}
        </h2>
        <Button
          onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))}
          className="bg-gray-600 hover:bg-gray-700"
        >
          Következő hét
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">
                Idő
              </th>
              {weekDays.map((day) => (
                <th
                  key={day.toString()}
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  <div>{format(day, 'EEEE', { locale: hu })}</div>
                  <div className="font-bold text-sm text-gray-700 dark:text-gray-300">
                    {format(day, 'MM.dd')}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {timeSlots.map((time) => (
              <tr key={time} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {time}
                </td>
                {weekDays.map((day) => {
                  const isAvailable = isSlotAvailable(day, time);
                  const bookingCount = getSlotBookingCount(day, time);
                  const maxBookings = getSlotMaxBookings(day, time);
                  const isFull = bookingCount >= maxBookings && maxBookings > 0;

                  return (
                    <td
                      key={day.toString() + time}
                      className={`px-4 py-2 whitespace-nowrap text-sm text-center cursor-pointer ${isAvailable
                        ? isFull
                          ? 'bg-red-50 dark:bg-red-900/20'
                          : 'bg-green-50 dark:bg-green-900/20'
                        : 'bg-gray-100 dark:bg-gray-800'
                        }`}
                      onClick={() => isAvailable && handleSlotClick(day, time)}
                    >
                      {isAvailable ? (
                        <div>
                          <div className="font-medium">
                            {bookingCount} / {maxBookings}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {isFull ? 'Betelt' : 'Szabad'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-600">-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeeklyCalendarView;
