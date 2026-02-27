import React from 'react';

const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-slate-700/50 rounded ${className}`} />
);

const ProfileSkeleton = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar Skeleton */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 space-y-6">
                        <div className="flex flex-col items-center">
                            <Skeleton className="w-32 h-32 rounded-full mb-6" />
                            <Skeleton className="w-48 h-8 mb-2" />
                            <Skeleton className="w-32 h-4 mb-6" />
                            <Skeleton className="w-full h-24 rounded-2xl" />
                        </div>
                        <div className="space-y-4">
                            <Skeleton className="w-full h-10 rounded-xl" />
                            <Skeleton className="w-full h-10 rounded-xl" />
                            <Skeleton className="w-full h-10 rounded-xl" />
                        </div>
                    </div>
                </div>

                {/* Main Content Skeleton */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 h-48" />
                    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 space-y-8">
                        <div className="flex justify-between items-center">
                            <Skeleton className="w-48 h-8" />
                            <Skeleton className="w-8 h-8" />
                        </div>
                        <div className="space-y-12 pl-8">
                            <Skeleton className="w-full h-32 rounded-2xl" />
                            <Skeleton className="w-full h-32 rounded-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSkeleton;
