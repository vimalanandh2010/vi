import React, { useState } from 'react';
import Navbar from './Navbar';
import RecruiterSidebar from './Recruiter/RecruiterSidebar';

const RecruiterLayout = ({ children, jobCount = 0 }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-white font-poppins">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-[55] lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar — hidden on mobile, shown on lg+ or when sidebarOpen */}
            <div className={`
                fixed top-0 left-0 h-full z-[60] transform transition-transform duration-300
                lg:relative lg:translate-x-0 lg:flex lg:shrink-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <RecruiterSidebar jobCount={jobCount} onClose={() => setSidebarOpen(false)} />
            </div>

            {/* Right Side: Navbar + Main Content */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                {/* Navbar with hamburger toggle */}
                <Navbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} showSidebarToggle={true} />

                {/* Scrollable Content */}
                <main className="flex-1 overflow-hidden bg-[#FDFDFD] recruiter-content flex flex-col">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default RecruiterLayout;
