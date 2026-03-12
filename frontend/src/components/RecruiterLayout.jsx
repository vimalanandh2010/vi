import React, { useState } from 'react';
import Navbar from './Navbar';
import RecruiterSidebar from './Recruiter/RecruiterSidebar';

const RecruiterLayout = ({ children, jobCount = 0 }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="fixed inset-0 flex overflow-hidden bg-white font-poppins">
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
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-[#FDFDFD]">
                {/* Navbar with hamburger toggle */}
                <div className="shrink-0">
                    <Navbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} showSidebarToggle={true} />
                </div>

                {/* Scrollable Content */}
                <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar recruiter-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default RecruiterLayout;
