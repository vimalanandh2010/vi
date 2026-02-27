import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from './AuthContext';

const CompanyContext = createContext();

export const useCompany = () => useContext(CompanyContext);

export const CompanyProvider = ({ children }) => {
    const { user } = useAuth();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCompany = async () => {
        if (!user || user.role !== 'employer') {
            setLoading(false);
            return;
        }

        try {
            const res = await axiosClient.get('companies/my-company');
            // Assuming axiosClient directly returns response.data
            setCompany(res);
            setError(null);
        } catch (err) {
            console.error('Error fetching company context:', err);
            setError(err.response?.data?.message || err.message || 'Failed to fetch company');
            setCompany(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompany();
    }, [user]);

    const updateCompanyContext = (newCompanyData) => {
        setCompany(newCompanyData);
    };

    const value = {
        company,
        loading,
        error,
        fetchCompany,
        updateCompanyContext
    };

    return (
        <CompanyContext.Provider value={value}>
            {children}
        </CompanyContext.Provider>
    );
};
