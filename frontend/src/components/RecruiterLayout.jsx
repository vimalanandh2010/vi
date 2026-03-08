import React from 'react';
import Navbar from './Navbar';
import RecruiterSidebar from './Recruiter/RecruiterSidebar';

const RecruiterLayout = ({ children, jobCount = 0 }) => {
    return (
        <div className="flex h-screen overflow-hidden bg-white">
            {/* Full-Height Static Sidebar */}
            <RecruiterSidebar jobCount={jobCount} />

            {/* Right Side: Navbar + Main Content */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                {/* Navbar now sits at the top of the content area */}
                <Navbar />

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto bg-[#FDFDFD] custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default RecruiterLayout;
