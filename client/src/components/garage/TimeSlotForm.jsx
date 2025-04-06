import React from "react";
import { Button } from "../ui/button";

const TimeSlotForm = ({ 
  darkMode, 
  newTimeSlot, 
  setNewTimeSlot, 
  handleAddTimeSlot 
}) => {
  return (
    <div className={`p-6 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-200"} mb-6`}>
      <h3 className="text-lg font-medium mb-4">Új időpont hozzáadása</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block mb-2 text-sm font-medium">Kezdő időpont</label>
          <input
            type="time"
            value={newTimeSlot.start_time}
            onChange={(e) => setNewTimeSlot({ ...newTimeSlot, start_time: e.target.value })}
            className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium">Záró időpont</label>
          <input
            type="time"
            value={newTimeSlot.end_time}
            onChange={(e) => setNewTimeSlot({ ...newTimeSlot, end_time: e.target.value })}
            className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium">Max. foglalás</label>
          <input
            type="number"
            min="1"
            value={newTimeSlot.max_bookings}
            onChange={(e) => setNewTimeSlot({ ...newTimeSlot, max_bookings: parseInt(e.target.value) })}
            className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
          />
        </div>
      </div>
      <div className="mt-4">
        <Button onClick={handleAddTimeSlot}>
          Időpont hozzáadása
        </Button>
      </div>
    </div>
  );
};

export default TimeSlotForm;
