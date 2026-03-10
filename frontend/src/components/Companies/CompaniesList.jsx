import React from 'react';
import CompanyCard from '../Cards/CompanyCard';

/**
 * CompaniesList - renders a list/grid of CompanyCard components.
 * Props:
 *   - companies: array of company objects
 *   - loading: boolean indicating loading state
 *   - onSave: optional callback when a company is saved/favorited
 */
const CompaniesList = ({ companies = [], loading = false, onSave }) => {
    // Placeholder cards while loading
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5].map(i => (
                    <div
                        key={i}
                        className="h-64 bg-slate-900/50 animate-pulse rounded-3xl border border-slate-800/50"
                    />
                ))}
            </div>
        );
    }

    if (companies.length === 0) {
        return (
            <div className="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm">
                <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Building2 size={32} className="text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No companies found</h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                    We couldn't find any companies matching your current filters or search terms.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {companies.map((company) => (
                <CompanyCard
                    key={company._id}
                    company={company}
                    isSaved={false}
                    onSave={onSave}
                    onClick={() => { }}
                />
            ))}
        </div>
    );
};

export default CompaniesList;
