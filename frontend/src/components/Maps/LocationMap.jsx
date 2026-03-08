import React, { useState, useEffect } from 'react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { MapPin, Loader2 } from 'lucide-react';

const LocationMap = ({ 
    location, 
    coordinates = null, 
    height = '300px',
    zoom = 13,
    className = '' 
}) => {
    const [center, setCenter] = useState(coordinates || { lat: 20.5937, lng: 78.9629 }); // Default to India
    const [loading, setLoading] = useState(!coordinates);
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    useEffect(() => {
        // If coordinates are provided, use them
        if (coordinates) {
            setCenter(coordinates);
            setLoading(false);
            return;
        }

        // Otherwise, geocode the location string
        if (location && apiKey) {
            geocodeLocation(location);
        }
    }, [location, coordinates, apiKey]);

    const geocodeLocation = async (locationString) => {
        try {
            setLoading(true);
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationString)}&key=${apiKey}`
            );
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                const { lat, lng } = data.results[0].geometry.location;
                setCenter({ lat, lng });
            }
        } catch (error) {
            console.error('Geocoding error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!apiKey) {
        return (
            <div 
                className={`w-full bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center ${className}`}
                style={{ height }}
            >
                <div className="text-center p-6">
                    <MapPin className="text-slate-300 mx-auto mb-2" size={32} />
                    <p className="text-slate-400 text-sm font-bold">Map unavailable</p>
                    <p className="text-slate-300 text-xs">API key not configured</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div 
                className={`w-full bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center ${className}`}
                style={{ height }}
            >
                <div className="text-center">
                    <Loader2 className="text-slate-400 mx-auto mb-2 animate-spin" size={32} />
                    <p className="text-slate-400 text-sm font-bold">Loading map...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm ${className}`} style={{ height }}>
            <APIProvider apiKey={apiKey}>
                <Map
                    defaultCenter={center}
                    defaultZoom={zoom}
                    gestureHandling="cooperative"
                    disableDefaultUI={false}
                    mapId="job-portal-map"
                    style={{ width: '100%', height: '100%' }}
                >
                    <Marker position={center} />
                </Map>
            </APIProvider>
        </div>
    );
};

export default LocationMap;
