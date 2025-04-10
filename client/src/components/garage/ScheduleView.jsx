import React from "react";
import { Button } from "../ui/button";
import { Tooltip } from "../ui/tooltip";
import TimeSlotForm from "./TimeSlotForm";
import { format } from "date-fns";

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
    const getDayButtonColor = (day) => {
        const slotCount = schedule[day].length;
        if (slotCount === 0) return darkMode ? "bg-[#252830] hover:bg-[#2d3039]" : "bg-gray-100 hover:bg-gray-200";
        if (day === selectedDay) return "bg-[#4e77f4] text-white";
        return `bg-[#4e77f4] bg-opacity-${Math.min(20 + slotCount * 10, 90)} hover:bg-opacity-${Math.min(30 + slotCount * 10, 100)} text-${darkMode ? "white" : "black"}`;
    };

    return (
        <div className={`rounded-xl ${darkMode ? "bg-[#1e2129]" : "bg-white"} shadow-lg p-6`}>
            <div className="flex flex-wrap gap-3 mb-6">
                {Object.keys(schedule).map(day => (
                    <Tooltip key={day} content={`${getDayLabel(day)}: ${schedule[day].length} időpont`}>
                        <button
                            onClick={() => setSelectedDay(day)}
                            className={`px-4 py-2 rounded-lg transition-colors relative ${selectedDay === day
                                ? "bg-[#4e77f4] text-white"
                                : getDayButtonColor(day)
                                }`}
                        >
                            {getDayLabel(day)}
                            {schedule[day].length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {schedule[day].length}
                                </span>
                            )}
                        </button>
                    </Tooltip>
                ))}
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">{getDayLabel(selectedDay)} - Időpontok</h2>

                {schedule[selectedDay].length === 0 ? (
                    <div className="p-8 text-center border border-dashed rounded-lg border-gray-300 dark:border-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400 italic">Nincsenek beállított időpontok erre a napra</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Használja az alábbi űrlapot új időpont hozzáadásához</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {schedule[selectedDay].map((slot, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-200"} hover:shadow-md transition-shadow`}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="font-medium text-lg">
                                            {typeof slot.start_time === 'string'
                                                ? slot.start_time
                                                : format(slot.start_time, "HH:mm")} - {
                                                typeof slot.end_time === 'string'
                                                    ? slot.end_time
                                                    : format(slot.end_time, "HH:mm")}
                                        </span>
                                        <div className="flex items-center mt-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Max. foglalás: <span className="font-semibold">{slot.max_bookings}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <Tooltip content="Időpont törlése">
                                        <button
                                            onClick={() => handleRemoveTimeSlot(selectedDay, index)}
                                            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                                            aria-label="Időpont törlése"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </Tooltip>
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
                <h3 className="text-lg font-medium mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                        <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                    </svg>
                    Beosztás másolása másik napról
                </h3>
                <div className="flex flex-wrap gap-3">
                    {Object.keys(schedule).map(day => (
                        day !== selectedDay && (
                            <Tooltip key={day} content={`${schedule[day].length} időpont másolása a ${getDayLabel(selectedDay)} napra`}>
                                <Button
                                    onClick={() => handleCopySchedule(day)}
                                    className={`bg-gray-600 hover:bg-gray-700 ${schedule[day].length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={schedule[day].length === 0}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                                        <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
                                    </svg>
                                    {getDayLabel(day)} beosztásának másolása
                                </Button>
                            </Tooltip>
                        )
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ScheduleView;