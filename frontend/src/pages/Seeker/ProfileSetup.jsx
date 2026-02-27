import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { User, MapPin, GraduationCap, Briefcase, Upload, ArrowRight, ArrowLeft, Check, Github, Linkedin, Globe, Layers, Plus, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { toast } from 'react-toastify'

const ProfileSetup = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [currentStep, setCurrentStep] = useState(1)
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        // Step 1: Basic Info
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phoneNumber: user?.phoneNumber || '',
        location: user?.location || '',
        aboutMe: user?.aboutMe || '',

        // Step 2: Education
        education: {
            tenth: {
                schoolName: user?.education?.find(e => e.level === '10th')?.schoolName || '',
                score: user?.education?.find(e => e.level === '10th')?.score || ''
            },
            twelfth: {
                schoolOrCollegeName: user?.education?.find(e => e.level === '12th')?.schoolOrCollegeName || '',
                score: user?.education?.find(e => e.level === '12th')?.score || ''
            },
            degree: {
                degreeName: user?.education?.find(e => e.level === 'Graduation')?.degreeName || '',
                collegeName: user?.education?.find(e => e.level === 'Graduation')?.institutionName || user?.education?.find(e => e.level === 'Graduation')?.collegeName || '',
                yearOfPassing: user?.education?.find(e => e.level === 'Graduation')?.yearOfPassing || '',
                score: user?.education?.find(e => e.level === 'Graduation')?.score || ''
            }
        },

        // Step 3: Experience
        experience: user?.experience || [],

        // Step 4: Projects
        projects: user?.projects || [],

        // Step 5: Professional
        experienceLevel: user?.experienceLevel || 'fresher',
        preferredRole: user?.preferredRole || '',
        primarySkill: user?.primarySkill || '',

        // Step 6: Files
        resume: null,
        photo: null,

        // Social Links (Optional)
        githubUrl: user?.githubUrl || '',
        linkedInUrl: user?.linkedInUrl || '',
        portfolioUrl: user?.portfolioUrl || ''
    })

    const steps = [
        { number: 1, title: 'Basic Information', icon: User },
        { number: 2, title: 'Education', icon: GraduationCap },
        { number: 3, title: 'Experience', icon: Briefcase },
        { number: 4, title: 'Projects', icon: Layers },
        { number: 5, title: 'Role & Skills', icon: Check },
        { number: 6, title: 'Upload Documents', icon: Upload }
    ]

    const handleChange = (e) => {
        const { name, value } = e.target

        // Handle nested education fields
        if (name.startsWith('education.')) {
            const parts = name.split('.')
            setFormData(prev => ({
                ...prev,
                education: {
                    ...prev.education,
                    [parts[1]]: {
                        ...prev.education[parts[1]],
                        [parts[2]]: value
                    }
                }
            }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleFileChange = (e) => {
        const { name, files } = e.target
        if (files && files[0]) {
            setFormData(prev => ({ ...prev, [name]: files[0] }))
        }
    }

    const validateStep = (step) => {
        switch (step) {
            case 1:
                return formData.firstName && formData.lastName && formData.phoneNumber && formData.location
            case 2:
                return formData.education.degree.degreeName && formData.education.degree.collegeName
            case 3:
                return formData.experienceLevel === 'fresher' || formData.experience.length > 0
            case 4:
                return true // Projects optional during setup
            case 5:
                return formData.experienceLevel && formData.preferredRole && formData.primarySkill
            case 6:
                return formData.resume !== null
            default:
                return true
        }
    }

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, steps.length))
        } else {
            toast.warning('Please fill all required fields')
        }
    }

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1))
    }

    const handleComplete = async () => {
        if (!validateStep(6)) {
            toast.warning('Please upload your resume')
            return
        }

        setLoading(true)
        try {
            // 1. Update basic profile info
            const profileData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phoneNumber: formData.phoneNumber,
                location: formData.location,
                aboutMe: formData.aboutMe,
                preferredRole: formData.preferredRole,
                primarySkill: formData.primarySkill,
                experienceLevel: formData.experienceLevel,
                education: [
                    { ...formData.education.tenth, level: '10th' },
                    { ...formData.education.twelfth, level: '12th' },
                    { ...formData.education.degree, level: 'Graduation', institutionName: formData.education.degree.collegeName }
                ],
                experience: formData.experience,
                projects: formData.projects,
                githubUrl: formData.githubUrl,
                linkedInUrl: formData.linkedInUrl,
                portfolioUrl: formData.portfolioUrl
            }

            await axios.put('/api/jobseeker/profile', profileData)

            // 2. Upload resume
            const resumeFormData = new FormData()
            resumeFormData.append('resume', formData.resume)
            await axios.post('/api/jobseeker/resume', resumeFormData)

            // 3. Upload photo if provided
            if (formData.photo) {
                const photoFormData = new FormData()
                photoFormData.append('photo', formData.photo)
                await axios.post('/api/jobseeker/photo', photoFormData)
            }

            // 4. Navigate to dashboard
            toast.success('Profile completed successfully!')
            navigate('/seeker/dashboard')

        } catch (error) {
            console.error('Profile completion error:', error)
            toast.error('Failed to complete profile: ' + (error.response?.data?.message || error.message))
        } finally {
            setLoading(false)
        }
    }

    const handleAddExperience = () => {
        setFormData(prev => ({
            ...prev,
            experience: [...prev.experience, { role: '', company: '', duration: '', description: '', type: 'job' }]
        }))
    }

    const handleRemoveExperience = (index) => {
        setFormData(prev => ({
            ...prev,
            experience: prev.experience.filter((_, i) => i !== index)
        }))
    }

    const handleExperienceChange = (index, field, value) => {
        const updatedExp = [...formData.experience]
        updatedExp[index][field] = value
        setFormData(prev => ({ ...prev, experience: updatedExp }))
    }

    const handleAddProject = () => {
        setFormData(prev => ({
            ...prev,
            projects: [...prev.projects, { title: '', description: '', link: '', technologies: [] }]
        }))
    }

    const handleRemoveProject = (index) => {
        setFormData(prev => ({
            ...prev,
            projects: prev.projects.filter((_, i) => i !== index)
        }))
    }

    const handleProjectChange = (index, field, value) => {
        const updatedProj = [...formData.projects]
        if (field === 'technologies') {
            updatedProj[index][field] = value.split(',').map(t => t.trim())
        } else {
            updatedProj[index][field] = value
        }
        setFormData(prev => ({ ...prev, projects: updatedProj }))
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-white mb-6">Tell us about yourself</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-slate-300 mb-2 font-medium">First Name *</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-slate-300 mb-2 font-medium">Last Name *</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-slate-300 mb-2 font-medium">Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-slate-300 mb-2 font-medium">Location (City/State) *</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g., Chennai, Tamil Nadu"
                                    className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-slate-300 mb-2 font-medium">About Me</label>
                            <textarea
                                name="aboutMe"
                                value={formData.aboutMe}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Tell us about yourself, your interests, and career goals..."
                                className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                    </div>
                )

            case 2:
                return (
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-white mb-6">Education Details</h3>

                        {/* 10th */}
                        <div className="bg-slate-900/30 rounded-xl p-6 border border-slate-800">
                            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Check size={18} className="text-blue-500" />
                                10th Standard
                            </h4>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-300 mb-2 text-sm">School Name</label>
                                    <input
                                        type="text"
                                        name="education.tenth.schoolName"
                                        value={formData.education.tenth.schoolName}
                                        onChange={handleChange}
                                        className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-300 mb-2 text-sm">Score/Percentage</label>
                                    <input
                                        type="text"
                                        name="education.tenth.score"
                                        value={formData.education.tenth.score}
                                        onChange={handleChange}
                                        placeholder="e.g., 85%"
                                        className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 12th */}
                        <div className="bg-slate-900/30 rounded-xl p-6 border border-slate-800">
                            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Check size={18} className="text-blue-500" />
                                12th Standard
                            </h4>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-300 mb-2 text-sm">School/College Name</label>
                                    <input
                                        type="text"
                                        name="education.twelfth.schoolOrCollegeName"
                                        value={formData.education.twelfth.schoolOrCollegeName}
                                        onChange={handleChange}
                                        className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-300 mb-2 text-sm">Score/Percentage</label>
                                    <input
                                        type="text"
                                        name="education.twelfth.score"
                                        value={formData.education.twelfth.score}
                                        onChange={handleChange}
                                        placeholder="e.g., 90%"
                                        className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Degree */}
                        <div className="bg-slate-900/30 rounded-xl p-6 border border-slate-800 border-l-4 border-l-blue-500">
                            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <GraduationCap size={18} className="text-blue-500" />
                                Degree/Diploma *
                            </h4>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-300 mb-2 text-sm">Degree Name *</label>
                                    <input
                                        type="text"
                                        name="education.degree.degreeName"
                                        value={formData.education.degree.degreeName}
                                        onChange={handleChange}
                                        placeholder="e.g., B.Tech, B.E., BCA"
                                        className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-300 mb-2 text-sm">College Name *</label>
                                    <input
                                        type="text"
                                        name="education.degree.collegeName"
                                        value={formData.education.degree.collegeName}
                                        onChange={handleChange}
                                        className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-300 mb-2 text-sm">Year of Passing</label>
                                    <input
                                        type="number"
                                        name="education.degree.yearOfPassing"
                                        value={formData.education.degree.yearOfPassing}
                                        onChange={handleChange}
                                        min="1990"
                                        max="2100"
                                        placeholder="e.g., 2024"
                                        className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-300 mb-2 text-sm">Score/CGPA</label>
                                    <input
                                        type="text"
                                        name="education.degree.score"
                                        value={formData.education.degree.score}
                                        onChange={handleChange}
                                        placeholder="e.g., 8.5 CGPA or 85%"
                                        className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )

            case 3:
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white">Work Experience</h3>
                            <button
                                onClick={handleAddExperience}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-600/30 hover:bg-blue-600/30 transition-all text-sm font-bold"
                            >
                                <Plus size={16} /> Add Experience
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.experience.length === 0 ? (
                                <div className="text-center py-10 bg-slate-900/20 border border-dashed border-slate-700 rounded-2xl">
                                    <Briefcase size={40} className="mx-auto text-slate-700 mb-3" />
                                    <p className="text-slate-400">No experience added yet.</p>
                                    <p className="text-slate-600 text-sm">If you're a fresher, you can skip this step.</p>
                                </div>
                            ) : (
                                formData.experience.map((exp, index) => (
                                    <div key={index} className="bg-slate-900/40 border border-slate-700 rounded-2xl p-6 relative group">
                                        <button
                                            onClick={() => handleRemoveExperience(index)}
                                            className="absolute top-4 right-4 text-slate-500 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-slate-400 text-xs mb-2 uppercase font-black">Role/Position</label>
                                                <input
                                                    type="text"
                                                    value={exp.role}
                                                    onChange={(e) => handleExperienceChange(index, 'role', e.target.value)}
                                                    placeholder="e.g. Frontend Developer"
                                                    className="w-full bg-slate-900/50 border border-slate-800 text-white rounded-xl py-2.5 px-4 focus:ring-1 focus:ring-blue-500/50"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-slate-400 text-xs mb-2 uppercase font-black">Company</label>
                                                <input
                                                    type="text"
                                                    value={exp.company}
                                                    onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                                                    placeholder="e.g. Google"
                                                    className="w-full bg-slate-900/50 border border-slate-800 text-white rounded-xl py-2.5 px-4 focus:ring-1 focus:ring-blue-500/50"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-slate-400 text-xs mb-2 uppercase font-black">Duration</label>
                                                <input
                                                    type="text"
                                                    value={exp.duration}
                                                    onChange={(e) => handleExperienceChange(index, 'duration', e.target.value)}
                                                    placeholder="e.g. Jan 2022 - Present"
                                                    className="w-full bg-slate-900/50 border border-slate-800 text-white rounded-xl py-2.5 px-4 focus:ring-1 focus:ring-blue-500/50"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-slate-400 text-xs mb-2 uppercase font-black">Type</label>
                                                <select
                                                    value={exp.type}
                                                    onChange={(e) => handleExperienceChange(index, 'type', e.target.value)}
                                                    className="w-full bg-slate-900/50 border border-slate-800 text-white rounded-xl py-2.5 px-4 focus:ring-1 focus:ring-blue-500/50"
                                                >
                                                    <option value="job">Full-time Job</option>
                                                    <option value="internship">Internship</option>
                                                    <option value="freelance">Freelance</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <label className="block text-slate-400 text-xs mb-2 uppercase font-black">Description</label>
                                            <textarea
                                                value={exp.description}
                                                onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                                                rows="3"
                                                placeholder="Briefly describe your responsibilities and achievements..."
                                                className="w-full bg-slate-900/50 border border-slate-800 text-white rounded-xl py-2.5 px-4 focus:ring-1 focus:ring-blue-500/50"
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )

            case 4:
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white">Featured Projects</h3>
                            <button
                                onClick={handleAddProject}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg border border-purple-600/30 hover:bg-purple-600/30 transition-all text-sm font-bold"
                            >
                                <Plus size={16} /> Add Project
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.projects.length === 0 ? (
                                <div className="text-center py-10 bg-slate-900/20 border border-dashed border-slate-700 rounded-2xl">
                                    <Layers size={40} className="mx-auto text-slate-700 mb-3" />
                                    <p className="text-slate-400">Showcase your best work!</p>
                                    <p className="text-slate-600 text-sm">Add personal projects, open source contributions, etc.</p>
                                </div>
                            ) : (
                                formData.projects.map((proj, index) => (
                                    <div key={index} className="bg-slate-900/40 border border-slate-700 rounded-2xl p-6 relative group">
                                        <button
                                            onClick={() => handleRemoveProject(index)}
                                            className="absolute top-4 right-4 text-slate-500 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <label className="block text-slate-400 text-xs mb-2 uppercase font-black">Project Title</label>
                                                <input
                                                    type="text"
                                                    value={proj.title}
                                                    onChange={(e) => handleProjectChange(index, 'title', e.target.value)}
                                                    placeholder="e.g. E-commerce Platform"
                                                    className="w-full bg-slate-900/50 border border-slate-800 text-white rounded-xl py-2.5 px-4 focus:ring-1 focus:ring-blue-500/50"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-slate-400 text-xs mb-2 uppercase font-black">Project Description</label>
                                                <textarea
                                                    value={proj.description}
                                                    onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                                                    rows="2"
                                                    placeholder="What does this project do?"
                                                    className="w-full bg-slate-900/50 border border-slate-800 text-white rounded-xl py-2.5 px-4 focus:ring-1 focus:ring-blue-500/50"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-slate-400 text-xs mb-2 uppercase font-black">Project Link (Optional)</label>
                                                <input
                                                    type="url"
                                                    value={proj.link}
                                                    onChange={(e) => handleProjectChange(index, 'link', e.target.value)}
                                                    placeholder="https://..."
                                                    className="w-full bg-slate-900/50 border border-slate-800 text-white rounded-xl py-2.5 px-4 focus:ring-1 focus:ring-blue-500/50"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-slate-400 text-xs mb-2 uppercase font-black">Tech Stack (comma separated)</label>
                                                <input
                                                    type="text"
                                                    value={proj.technologies?.join(', ')}
                                                    onChange={(e) => handleProjectChange(index, 'technologies', e.target.value)}
                                                    placeholder="React, Node.js, MongoDB"
                                                    className="w-full bg-slate-900/50 border border-slate-800 text-white rounded-xl py-2.5 px-4 focus:ring-1 focus:ring-blue-500/50"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )

            case 5:
                return (
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-white mb-6">Role & Skills</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-slate-300 mb-2 font-medium">Experience Level *</label>
                                <select
                                    name="experienceLevel"
                                    value={formData.experienceLevel}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    required
                                >
                                    <option value="fresher" className="bg-slate-900 text-white">Fresher</option>
                                    <option value="experienced" className="bg-slate-900 text-white">Experienced</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-slate-300 mb-2 font-medium">Preferred Role *</label>
                                <input
                                    type="text"
                                    name="preferredRole"
                                    value={formData.preferredRole}
                                    onChange={handleChange}
                                    placeholder="e.g. Full Stack Developer, Data Analyst"
                                    className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-slate-300 mb-2 font-medium">Primary Skills * (Comma separated)</label>
                            <input
                                type="text"
                                name="primarySkill"
                                value={formData.primarySkill}
                                onChange={handleChange}
                                placeholder="e.g., React, Python, Java, AWS"
                                className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                required
                            />
                        </div>

                        {/* Social Links Section */}
                        <div className="pt-6 border-t border-slate-700/50 space-y-4">
                            <h4 className="text-lg font-semibold text-white">Socials (Optional)</h4>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <label className="block text-slate-400 text-sm mb-2">GitHub URL</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Github size={18} className="text-slate-500" />
                                        </div>
                                        <input
                                            type="url"
                                            name="githubUrl"
                                            value={formData.githubUrl}
                                            onChange={handleChange}
                                            placeholder="https://github.com/yourusername"
                                            className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        />
                                    </div>
                                </div>

                                <div className="relative">
                                    <label className="block text-slate-400 text-sm mb-2">LinkedIn URL</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Linkedin size={18} className="text-slate-500" />
                                        </div>
                                        <input
                                            type="url"
                                            name="linkedInUrl"
                                            value={formData.linkedInUrl}
                                            onChange={handleChange}
                                            placeholder="https://linkedin.com/in/yourusername"
                                            className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )

            case 6:
                return (
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-white mb-6">Upload Documents</h3>
                        <div className="bg-slate-900/30 rounded-xl p-8 border-2 border-dashed border-slate-700 hover:border-blue-500/50 transition-all text-center">
                            <Upload size={32} className="mx-auto text-blue-500 mb-4" />
                            <label className="block text-slate-300 mb-2 font-bold cursor-pointer">Resume (PDF, DOC) *</label>
                            <input
                                type="file"
                                name="resume"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                                className="hidden"
                                id="resume-upload"
                                required
                            />
                            <label htmlFor="resume-upload" className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg cursor-pointer transition-all mt-2">
                                Choose File
                            </label>
                            {formData.resume && (
                                <p className="text-emerald-400 mt-4 text-sm font-bold flex items-center justify-center gap-2">
                                    <Check size={16} /> Selected: {formData.resume.name}
                                </p>
                            )}
                        </div>

                        <div className="bg-slate-900/30 rounded-xl p-8 border-2 border-dashed border-slate-700 hover:border-blue-500/50 transition-all text-center">
                            <User size={32} className="mx-auto text-indigo-500 mb-4" />
                            <label className="block text-slate-300 mb-2 font-bold cursor-pointer">Profile Photo (Optional)</label>
                            <input
                                type="file"
                                name="photo"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                id="photo-upload"
                            />
                            <label htmlFor="photo-upload" className="inline-block px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg cursor-pointer transition-all mt-2">
                                Choose Photo
                            </label>
                            {formData.photo && (
                                <p className="text-emerald-400 mt-4 text-sm font-bold flex items-center justify-center gap-2">
                                    <Check size={16} /> Selected: {formData.photo.name}
                                </p>
                            )}
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Progress Indicator */}
                <div className="mb-12">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => {
                            const Icon = step.icon
                            const isActive = currentStep === step.number
                            const isCompleted = currentStep > step.number

                            return (
                                <React.Fragment key={step.number}>
                                    <div className="flex flex-col items-center">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${isCompleted ? 'bg-green-600 border-green-600' :
                                            isActive ? 'bg-blue-600 border-blue-600' :
                                                'bg-slate-800 border-slate-700'
                                            }`}>
                                            {isCompleted ? <Check className="text-white" size={24} /> : <Icon className="text-white" size={20} />}
                                        </div>
                                        <p className={`mt-2 text-sm ${isActive ? 'text-white font-semibold' : 'text-slate-400'}`}>
                                            {step.title}
                                        </p>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`flex-1 h-1 mx-4 transition-all ${isCompleted ? 'bg-green-600' : 'bg-slate-700'
                                            }`} />
                                    )}
                                </React.Fragment>
                            )
                        })}
                    </div>
                    <div className="mt-8 text-center">
                        <p className="text-slate-400">Step {currentStep} of {steps.length}</p>
                    </div>
                </div>

                {/* Form Card */}
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl"
                >
                    {renderStepContent()}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8">
                        {currentStep > 1 && (
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all"
                            >
                                <ArrowLeft size={20} />
                                Back
                            </button>
                        )}

                        {currentStep < steps.length ? (
                            <button
                                onClick={handleNext}
                                className="ml-auto flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl transition-all"
                            >
                                Save & Next
                                <ArrowRight size={20} />
                            </button>
                        ) : (
                            <button
                                onClick={handleComplete}
                                disabled={loading}
                                className="ml-auto flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Completing...' : 'Complete Profile'}
                                <Check size={20} />
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default ProfileSetup
