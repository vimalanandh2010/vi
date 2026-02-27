import React from 'react';
import { motion } from 'framer-motion';
import {
    Clock,
    BookOpen,
    Users,
    Play,
    ArrowRight,
    CheckCircle2,
    GraduationCap,
    Award,
    FileText,
    Star,
    Heart
} from 'lucide-react';
import HoverCard from './HoverCard';

/**
 * CourseCard - Beautiful card with hover reveal for course listings
 * Reveals: curriculum, duration, instructor, enrollment count on hover
 */
const CourseCard = ({
    course,
    isEnrolled = false,
    onEnroll,
    onClick
}) => {
    const getLevelColor = (level) => {
        switch (level?.toLowerCase()) {
            case 'beginner':
                return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' };
            case 'intermediate':
                return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' };
            case 'advanced':
                return { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' };
            default:
                return { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' };
        }
    };

    const getGlowColor = (level) => {
        switch (level?.toLowerCase()) {
            case 'beginner':
                return 'green';
            case 'intermediate':
                return 'blue';
            case 'advanced':
                return 'purple';
            default:
                return 'blue';
        }
    };

    // Default data
    const levelColors = getLevelColor(course.level);
    const defaultModules = course.modules || [
        'Introduction to the Course',
        'Core Concepts',
        'Hands-on Projects',
        'Advanced Topics',
        'Final Assessment'
    ];
    const defaultDuration = course.duration || '8 weeks';
    const defaultEnrolled = course.enrolledCount || Math.floor(Math.random() * 500) + 50;
    const defaultRating = course.rating || (Math.random() * 2 + 3).toFixed(1);
    const defaultInstructor = course.instructor || 'Expert Instructor';

    return (
        <HoverCard
            glowColor={getGlowColor(course.level)}
            variant="glass"
            revealPosition="overlay"
            className="cursor-pointer"
        >
            {/* Main Content - Visible by default */}
            <div className="p-6" onClick={onClick}>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-blue-900/30 overflow-hidden">
                            {course.thumbnail ? (
                                <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <BookOpen size={32} />
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                                {course.title}
                            </h3>
                            <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                                <span className="truncate">{defaultInstructor}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-lg border ${levelColors.bg} ${levelColors.text} ${levelColors.border}`}>
                        {course.level || 'Beginner'}
                    </span>
                    <span className="px-3 py-1 text-xs font-medium text-slate-400 bg-slate-800/50 rounded-lg flex items-center gap-1">
                        <Clock size={12} /> {defaultDuration}
                    </span>
                    {course.rating && (
                        <span className="px-3 py-1 text-xs font-medium text-yellow-400 bg-yellow-500/10 rounded-lg flex items-center gap-1 border border-yellow-500/20">
                            <Star size={12} className="fill-yellow-400" /> {defaultRating}
                        </span>
                    )}
                </div>

                <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                    {course.description?.substring(0, 100) || 'Learn the fundamentals and advanced concepts with hands-on projects and expert guidance.'}...
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-700/30">
                    <div className="flex items-center gap-4 text-slate-500">
                        <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span className="text-xs font-bold">{defaultEnrolled} enrolled</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <FileText size={14} />
                            <span className="text-xs font-bold">{defaultModules.length} modules</span>
                        </div>
                    </div>

                    {isEnrolled ? (
                        <span className="flex items-center gap-1 px-4 py-2 bg-green-500/10 text-green-400 text-xs font-bold rounded-xl border border-green-500/20">
                            <CheckCircle2 size={14} /> Enrolled
                        </span>
                    ) : (
                        <button
                            onClick={(e) => { e.stopPropagation(); onEnroll?.(course._id); }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/30"
                        >
                            Enroll Now <ArrowRight size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Revealed Content - Shows on hover */}
            <div className="p-6 border-t border-slate-700/30">
                <div className="flex items-center gap-2 mb-4">
                    <BookOpen size={16} className="text-blue-400" />
                    <h4 className="text-sm font-bold text-white">Course Details</h4>
                </div>

                {/* Duration */}
                <div className="flex items-center justify-between mb-3 p-3 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Clock size={16} />
                        <span className="text-xs font-medium">Duration</span>
                    </div>
                    <span className="text-sm font-bold text-white">
                        {defaultDuration}
                    </span>
                </div>

                {/* Level */}
                <div className="flex items-center justify-between mb-3 p-3 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-400">
                        <GraduationCap size={16} />
                        <span className="text-xs font-medium">Level</span>
                    </div>
                    <span className={`text-sm font-bold ${levelColors.text}`}>
                        {course.level || 'Beginner'}
                    </span>
                </div>

                {/* Students Enrolled */}
                <div className="flex items-center justify-between mb-4 p-3 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Users size={16} />
                        <span className="text-xs font-medium">Students</span>
                    </div>
                    <span className="text-sm font-bold text-green-400">
                        {defaultEnrolled} enrolled
                    </span>
                </div>

                {/* Instructor */}
                <div className="flex items-center justify-between mb-4 p-3 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Award size={16} />
                        <span className="text-xs font-medium">Instructor</span>
                    </div>
                    <span className="text-sm font-bold text-white">
                        {defaultInstructor}
                    </span>
                </div>

                {/* Curriculum */}
                <div className="mb-4">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Curriculum</h5>
                    <ul className="space-y-1.5">
                        {defaultModules.slice(0, 4).map((module, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                                <Play size={12} className="text-blue-400 mt-0.5 shrink-0" />
                                <span className="line-clamp-1">{module}</span>
                            </li>
                        ))}
                        {defaultModules.length > 4 && (
                            <li className="text-xs text-slate-500">
                                +{defaultModules.length - 4} more modules
                            </li>
                        )}
                    </ul>
                </div>

                {/* What You'll Learn */}
                <div className="mb-4">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">What You'll Learn</h5>
                    <div className="flex flex-wrap gap-1.5">
                        {['Hands-on Projects', 'Industry Skills', 'Certificate', 'Lifetime Access'].map((item, idx) => (
                            <span key={idx} className="px-2 py-1 bg-green-500/10 text-green-400 text-[10px] font-medium rounded-lg border border-green-500/20">
                                {item}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4 p-3 bg-slate-800/50 rounded-xl">
                    <span className="text-xs font-medium text-slate-400">Course Price</span>
                    <span className="text-lg font-bold text-white">
                        {course.price === 0 ? 'Free' : `$${course.price || 49}`}
                    </span>
                </div>

                {/* View Course Button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onClick?.(); }}
                    className="w-full py-3 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white text-sm font-bold rounded-xl border border-blue-500/30 hover:border-blue-500 transition-all flex items-center justify-center gap-2"
                >
                    {isEnrolled ? 'Continue Learning' : 'View Course'} <ArrowRight size={16} />
                </button>
            </div>
        </HoverCard>
    );
};

export default CourseCard;
