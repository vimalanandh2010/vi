import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

const LocationAutocomplete = ({ 
    value, 
    onChange, 
    onPlaceSelect,
    placeholder = "Enter city, state, or country",
    className = "",
    required = false,
    disabled = false
}) => {
    const inputRef = useRef(null);
    const autocompleteRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    useEffect(() => {
        if (!apiKey || !window.google) {
            loadGoogleMapsScript();
            return;
        }
        initializeAutocomplete();
    }, [apiKey]);

    const loadGoogleMapsScript = () => {
        if (!apiKey) {
            setIsLoading(false);
            return;
        }

        // Check if script is already loaded
        if (window.google && window.google.maps) {
            initializeAutocomplete();
            return;
        }

        // Check if script is already being loaded
        if (document.querySelector('script[src*="maps.googleapis.com"]')) {
            const checkGoogle = setInterval(() => {
                if (window.google && window.google.maps) {
                    clearInterval(checkGoogle);
                    initializeAutocomplete();
                }
            }, 100);
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            initializeAutocomplete();
        };
        script.onerror = () => {
            console.error('Failed to load Google Maps script');
            setIsLoading(false);
        };
        document.head.appendChild(script);
    };

    const initializeAutocomplete = () => {
        if (!inputRef.current || !window.google) {
            setIsLoading(false);
            return;
        }

        try {
            const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
                types: ['(cities)', 'administrative_area_level_1', 'country'],
                fields: ['formatted_address', 'geometry', 'name', 'address_components']
            });

            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                
                if (place.geometry) {
                    const address = place.formatted_address || place.name;
                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();
                    
                    // Update input value
                    if (onChange) {
                        onChange(address);
                    }
                    
                    // Call callback with full place data
                    if (onPlaceSelect) {
                        onPlaceSelect({
                            address,
                            coordinates: { lat, lng },
                            place
                        });
                    }
                }
            });

            autocompleteRef.current = autocomplete;
            setIsLoading(false);
        } catch (error) {
            console.error('Error initializing autocomplete:', error);
            setIsLoading(false);
        }
    };

    // Fallback to regular input if Google Maps fails to load
    if (!apiKey) {
        return (
            <div className="relative">
                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange && onChange(e.target.value)}
                    placeholder={placeholder}
                    className={className}
                    required={required}
                    disabled={disabled}
                />
            </div>
        );
    }

    return (
        <div className="relative">
            <MapPin 
                className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 transition-colors z-10" 
                size={20} 
            />
            {isLoading && (
                <Loader2 
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 animate-spin z-10" 
                    size={16} 
                />
            )}
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange && onChange(e.target.value)}
                placeholder={placeholder}
                className={className}
                required={required}
                disabled={disabled}
                autoComplete="off"
            />
        </div>
    );
};

export default LocationAutocomplete;
