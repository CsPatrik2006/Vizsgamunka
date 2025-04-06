import React from "react";
import { Button } from "../ui/button";
import TimeSlotForm from "./TimeSlotForm";

const ScheduleView = ({
  darkMode,
  schedule,
  selectedDay,
  setSelectedDay,
  newTimeSlot,
  setNewTimeSlot,
  handleAddTimeSlot,
  handleRemoveTimeSlot,
  handleCopySchedule,
  getDayLabel
}) => {
  return (
    <div className={`rounded-xl ${darkMode ? "bg-[#1e2129]" : "bg-white"} shadow-lg p-6`}>
      <div className="flex flex-wrap gap-3 mb-6">
        {Object.keys(schedule).map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-lg transition-colors ${selectedDay === day
              ? "bg-[#4e77f4] text-white"
              : darkMode
                ? "bg-[#252830] hover:bg-[#2d3039]"
                : "bg-gray-100 hover:bg-gray-200"
              }`}
          >
            {getDayLabel(day)}
          </button>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{getDayLabel(selectedDay)} - Időpontok</h2>

        {schedule[selectedDay].length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 italic">Nincsenek beállított időpontok erre a napra</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedule[selectedDay].map((slot, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-200"}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{slot.start_time} - {slot.end_time}</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Max. foglalás: {slot.max_bookings}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveTimeSlot(selectedDay, index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TimeSlotForm 
        darkMode={darkMode} 
        newTimeSlot={newTimeSlot} 
        setNewTimeSlot={setNewTimeSlot} 
        handleAddTimeSlot={handleAddTimeSlot} 
      />

      <div className={`p-6 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-200"}`}>
        <h3 className="text-lg font-medium mb-4">Beosztás másolása másik napról</h3>
        <div className="flex flex-wrap gap-3">
          {Object.keys(schedule).map(day => (
            day !== selectedDay && (
              <Button
                key={day}
                onClick={() => handleCopySchedule(day)}
                className="bg-gray-600 hover:bg-gray-700"
              >
                {getDayLabel(day)} beosztásának másolása
              </Button>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScheduleView;
