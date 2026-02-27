import { useRef, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-toastify';

/**
 * Custom hook to debounce and batch API updates.
 * @param {string} endpoint - The API endpoint to send PUT requests to.
 * @param {number} delay - Debounce delay in milliseconds (default 1000ms).
 */
export const useAutoSave = (endpoint, delay = 1000) => {
    const pendingChanges = useRef({});
    const timeoutRef = useRef(null);

    const save = useCallback((data) => {
        // Accumulate changes defined in data
        pendingChanges.current = { ...pendingChanges.current, ...data };

        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout
        timeoutRef.current = setTimeout(async () => {
            const payload = { ...pendingChanges.current };
            // Clear pending changes *before* the request starts to avoid race conditions 
            // with new typing that might happen during the request.
            pendingChanges.current = {};

            try {
                if (Object.keys(payload).length === 0) return;

                // console.log("Auto-saving payload:", payload);
                // Remove /api prefix if present as axiosClient handles it
                const cleanEndpoint = endpoint.startsWith('/api') ? endpoint.replace('/api', '') : endpoint;
                await axiosClient.put(cleanEndpoint, payload);
                // We typically don't toast on every autosave to avoid spam, 
                // but you could add a discrete indicator here.
            } catch (error) {
                console.error("Autosave failed", error);

                // Optional: Put basic recovery logic here if needed
                // For now, silent fail is better than blocking UI
            }
        }, delay);
    }, [endpoint, delay]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                // Optionally: Flush pending changes on unmount? 
                // For a profile builder, better to not risk unmount-save race conditions.
            }
        };
    }, []);

    return save;
};
