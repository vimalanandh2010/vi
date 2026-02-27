import React, { useRef, useState, useEffect } from 'react';

const OtpInput = ({ length = 6, value, onChange, disabled }) => {
    const inputRefs = useRef([]);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index, e) => {
        const val = e.target.value;
        if (isNaN(val)) return;

        const newOtp = [...value.split('')];
        // Allow only one character per box
        newOtp[index] = val.substring(val.length - 1);
        const combinedOtp = newOtp.join('');
        onChange(combinedOtp);

        // Move to next input if value is entered
        if (val && index < length - 1 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !value[index] && index > 0 && inputRefs.current[index - 1]) {
            // Move to previous input on backspace if current is empty
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text').slice(0, length).replace(/[^0-9]/g, '');
        if (data) {
            onChange(data);
            // Focus on the last filled input or the first empty one
            const focusIndex = Math.min(data.length, length - 1);
            if (inputRefs.current[focusIndex]) {
                inputRefs.current[focusIndex].focus();
            }
        }
    };

    return (
        <div className="flex gap-2 sm:gap-4 justify-center">
            {Array.from({ length }, (_, index) => (
                <input
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value[index] || ''}
                    onChange={(e) => handleChange(index, e)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={disabled}
                    className="w-10 h-12 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold bg-slate-800/50 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
            ))}
        </div>
    );
};

export default OtpInput;
