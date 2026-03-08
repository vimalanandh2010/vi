import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar, Clock } from 'lucide-react';
import './DateTimePicker.css';

const DateTimePicker = ({ 
    selectedDate, 
    onDateChange, 
    selectedTime,
    onTimeChange,
    minDate = new Date(),
    label = "Select Date & Time",
    required = false,
    disabled = false,
    showTimeSelect = true
}) => {
    return (
        <div className="space-y-4">
            {label && (
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {label} {required && '*'}
                </label>
            )}
            
            <div className="grid md:grid-cols-2 gap-4">
                {/* Date Picker */}
                <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none" size={18} />
                    <DatePicker
                        selected={selectedDate}
                        onChange={onDateChange}
                        minDate={minDate}
                        dateFormat="MMMM d, yyyy"
                        className="w-full bg-slate-50 border border-transparent focus:border-black/10 focus:bg-white text-black font-bold rounded-2xl py-4 pl-12 pr-4 outline-none transition-all"
                        placeholderText="Select date"
                        required={required}
                        disabled={disabled}
                        calendarClassName="custom-calendar"
                    />
                </div>

                {/* Time Picker */}
                {showTimeSelect && (
                    <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none" size={18} />
                        <input
                            type="time"
                            value={selectedTime}
                            onChange={onTimeChange}
                            className="w-full bg-slate-50 border border-transparent focus:border-black/10 focus:bg-white text-black font-bold rounded-2xl py-4 pl-12 pr-4 outline-none transition-all"
                            required={required}
                            disabled={disabled}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default DateTimePicker;
