import React from "react";
import { Button } from "../ui/button";
import { Tooltip } from "../ui/tooltip";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parse, setHours, setMinutes, getHours, getMinutes } from "date-fns";
import { registerLocale } from "react-datepicker";
import hu from 'date-fns/locale/hu';

registerLocale('hu', hu);

const TimeSlotForm = ({
    darkMode,
    newTimeSlot,
    setNewTimeSlot,
    handleAddTimeSlot
}) => {
    const parseTime = (timeString) => {
        return parse(timeString, "HH:mm", new Date());
    };

    const handleTimeChange = (time, field) => {
        if (!time) return;
        const formattedTime = format(time, "HH:mm");
        setNewTimeSlot({ ...newTimeSlot, [field]: formattedTime });
    };

    const filterTime = (time) => {
        const hours = getHours(time);
        const minutes = getMinutes(time);

        if (hours < 8 || hours > 20) return false;
        if (hours === 20 && minutes > 0) return false;

        return minutes === 0 || minutes === 30;
    };

    return (
        <div className={`p-6 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-200"} mb-6`}>
            <h3 className="text-lg font-medium mb-4">Új időpont hozzáadása</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block mb-2 text-sm font-medium">Kezdő időpont</label>
                    <Tooltip content="Válassza ki a foglalási időszak kezdetét">
                        <div className={`w-full p-0 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus-within:ring-2 focus-within:ring-[#4e77f4] transition-all`}>
                            <DatePicker
                                selected={parseTime(newTimeSlot.start_time)}
                                onChange={(time) => handleTimeChange(time, "start_time")}
                                showTimeSelect
                                showTimeSelectOnly
                                timeIntervals={30}
                                timeCaption="Idő"
                                dateFormat="HH:mm"
                                timeFormat="HH:mm"
                                locale="hu"
                                filterTime={filterTime}
                                className={`w-full p-3 rounded-lg outline-none ${darkMode ? "bg-[#252830] text-white" : "bg-white text-black"}`}
                            />
                        </div>
                    </Tooltip>
                </div>
                <div>
                    <label className="block mb-2 text-sm font-medium">Záró időpont</label>
                    <Tooltip content="Válassza ki a foglalási időszak végét">
                        <div className={`w-full p-0 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus-within:ring-2 focus-within:ring-[#4e77f4] transition-all`}>
                            <DatePicker
                                selected={parseTime(newTimeSlot.end_time)}
                                onChange={(time) => handleTimeChange(time, "end_time")}
                                showTimeSelect
                                showTimeSelectOnly
                                timeIntervals={30}
                                timeCaption="Idő"
                                dateFormat="HH:mm"
                                timeFormat="HH:mm"
                                locale="hu"
                                filterTime={filterTime}
                                className={`w-full p-3 rounded-lg outline-none ${darkMode ? "bg-[#252830] text-white" : "bg-white text-black"}`}
                            />
                        </div>
                    </Tooltip>
                </div>
                <div>
                    <label className="block mb-2 text-sm font-medium">Max. foglalás</label>
                    <Tooltip content="Adja meg, hány párhuzamos foglalás engedélyezett ebben az időszakban">
                        <input
                            type="number"
                            min="1"
                            value={newTimeSlot.max_bookings}
                            onChange={(e) => setNewTimeSlot({ ...newTimeSlot, max_bookings: parseInt(e.target.value) })}
                            className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#252830] border-[#3a3f4b]" : "bg-white border-gray-300"} focus:ring-2 focus:ring-[#4e77f4] outline-none transition-all`}
                        />
                    </Tooltip>
                </div>
            </div>
            <div className="mt-4">
                <Tooltip content="Új időpont hozzáadása a kiválasztott naphoz">
                    <Button
                        onClick={handleAddTimeSlot}
                        className="flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Időpont hozzáadása
                    </Button>
                </Tooltip>
            </div>
        </div>
    );
};

export default TimeSlotForm;