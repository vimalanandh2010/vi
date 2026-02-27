import { useState, useEffect, useCallback, useRef } from 'react';

const useFetch = (apiFunction, dependencies = [], options = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [empty, setEmpty] = useState(false);

    const isMounted = useRef(true);

    const execute = useCallback(async (...args) => {
        setLoading(true);
        setError(null);
        setEmpty(false);

        try {
            const result = await apiFunction(...args);

            if (isMounted.current) {
                // Standardized response handling
                if (result?.success === false) {
                    throw new Error(result.message || 'API Error');
                }

                const responseData = result?.data || result;

                setData(responseData);

                // Check if empty (for arrays)
                if (Array.isArray(responseData) && responseData.length === 0) {
                    setEmpty(true);
                } else if (responseData && typeof responseData === 'object' && Object.keys(responseData).length === 0) {
                    // Empty object check - might be valid data though
                }
            }
        } catch (err) {
            if (isMounted.current) {
                console.error("useFetch Error:", err);
                setError(err.message || 'Something went wrong');
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    }, [apiFunction]);

    useEffect(() => {
        isMounted.current = true;
        if (!options.manual) {
            execute();
        }
        return () => {
            isMounted.current = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...dependencies]);

    return { data, loading, error, empty, refetch: execute };
};

export default useFetch;
