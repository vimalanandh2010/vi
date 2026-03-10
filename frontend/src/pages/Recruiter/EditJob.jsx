import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Send, X, Upload, MapPin, Briefcase, DollarSign, Tag, FileText, ChevronRight, AlertCircle, Sparkles, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, useParams, Link } from 'react-router-dom'
import RecruiterLayout from '../../components/RecruiterLayout'
import axiosClient from '../../api/axiosClient'
import { toast } from 'react-toastify'

const EditJob = () => {
    const { jobId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [formData, setFormData] = useState({
        title: '',
        location: '',
        type: 'Full Time',
        minSalary: '',
        maxSalary: '',
        experienceLevel: 'Entry Level',
        description: '',
        tags: '',
        requirements: '',
        poster: null,
        category: 'IT'
    })

    useEffect(() => {
        const fetchJobData = async () => {
            try {
                const res = await axiosClient.get(`jobs/${jobId}`)
                if (res) {
                    // Pre-fill form
                    // Salary usually comes in string format, we might need to parse it back if possible, 
                    // but for now let's just use the values if they exist or leave them blank
                    setFormData({
                        title: res.title || '',
                        location: res.location || '',
                        type: res.type || 'Full Time',
                        minSalary: '', // Handled if we have a way to parse, otherwise leave for user to update
                        maxSalary: '',
                        experienceLevel: res.experienceLevel || 'Entry Level',
                        description: res.description || '',
                        tags: Array.isArray(res.tags) ? res.tags.join(', ') : (res.tags || ''),
                        requirements: Array.isArray(res.requirements) ? res.requirements.join('\n') : (res.requirements || ''),
                        poster: null, // Don't pre-fill file
                        category: res.category || 'IT'
                    })
                }
            } catch (err) {
                console.error('Failed to fetch job:', err)
                toast.error('Failed to load job data')
                navigate('/recruiter/jobs')
            } finally {
                setFetching(false)
            }
        }
        fetchJobData()
    }, [jobId, navigate])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, poster: e.target.files[0] }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const postData = new FormData()

            let salaryString = ''
            if (formData.minSalary && formData.maxSalary) {
                salaryString = `₹${formData.minSalary}L - ₹${formData.maxSalary}L`
            } else if (formData.minSalary) {
                salaryString = `₹${formData.minSalary}L+`
            } else if (formData.maxSalary) {
                salaryString = `Up to ₹${formData.maxSalary}L`
            }

            Object.keys(formData).forEach(key => {
                if (key === 'poster') {
                    if (formData[key]) postData.append('poster', formData[key])
                } else {
                    postData.append(key, formData[key])
                }
            })

            if (salaryString) {
                postData.append('salary', salaryString)
            }

            await axiosClient.put(`jobs/${jobId}`, postData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            toast.success('Job updated successfully!')
            navigate('/recruiter/jobs')
        } catch (err) {
            console.error('[EditJob] Submit Error:', err)
            toast.error(err.response?.data?.message || err.message || 'Failed to update job')
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
        return (
            <RecruiterLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-600">
                    <Loader2 className="animate-spin mb-4 text-blue-600" size={40} />
                    <p className="text-sm font-semibold">Loading job details...</p>
                </div>
            </RecruiterLayout>
        )
    }

    return (
        <RecruiterLayout>
            <main className="p-4 sm:p-8 md:p-12 lg:p-16 max-w-5xl mx-auto bg-white min-h-full">
                {/* Header */}
                <header className="mb-12">
                    <div className="flex items-center gap-2 mb-4">
                        <Link to="/recruiter/jobs" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">
                            ← Back to Jobs
                        </Link>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        Edit Job Posting
                    </h1>
                    <p className="text-gray-600 text-base font-medium">Update your job posting details to attract the right candidates.</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-12 pb-24">
                    {/* Primary Role Architecture */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-slate-100 rounded-[3rem] p-10 lg:p-16 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden relative group"
                    >
                        <div className="flex items-center gap-6 mb-12">
                            <div className="p-5 bg-black text-white rounded-3xl shadow-2xl group-hover:scale-110 transition-transform">
                                <Briefcase size={28} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-black">Role Architecture</h2>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Foundational Parameters</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional Title *</label>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Senior Logic Architect"
                                    className="w-full bg-slate-50 border border-transparent focus:border-black/10 focus:bg-white text-black font-bold rounded-2xl py-5 px-6 outline-none transition-all placeholder:text-slate-300"
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deployment Location *</label>
                                <div className="relative">
                                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="City, Distributed, or Hybrid"
                                        className="w-full bg-slate-50 border border-transparent focus:border-black/10 focus:bg-white text-black font-bold rounded-2xl py-5 pl-14 pr-6 outline-none transition-all placeholder:text-slate-300"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Engagement Framework</label>
                                <div className="relative">
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-transparent focus:border-black/10 focus:bg-white text-black font-bold rounded-2xl py-5 px-6 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option>Full Time</option>
                                        <option>Part Time</option>
                                        <option>Internship</option>
                                        <option>Freelance</option>
                                        <option>Contract</option>
                                        <option>Remote</option>
                                        <option>Hybrid</option>
                                    </select>
                                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Domain Classification</label>
                                <div className="relative">
                                    <select
                                        name="category"
                                        value={formData.category || 'IT'}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-transparent focus:border-black/10 focus:bg-white text-black font-bold rounded-2xl py-5 px-6 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="IT">Technology / IT</option>
                                        <option value="Engineering">Engineering</option>
                                        <option value="Healthcare">Healthcare / Medical</option>
                                        <option value="Finance">Finance / Banking</option>
                                        <option value="Sales">Sales / Marketing</option>
                                        <option value="HR">Human Resources</option>
                                        <option value="CustomerService">Customer Service / Support</option>
                                        <option value="Education">Education / Training</option>
                                        <option value="Design">Design / Creative</option>
                                        <option value="Operations">Operations / Logistics</option>
                                        <option value="Legal">Legal / Compliance</option>
                                        <option value="Consulting">Consulting</option>
                                        <option value="Manufacturing">Manufacturing / Production</option>
                                        <option value="Construction">Construction</option>
                                        <option value="Retail">Retail / E-commerce</option>
                                        <option value="Hospitality">Hospitality / Tourism</option>
                                        <option value="Media">Media / Entertainment</option>
                                        <option value="RealEstate">Real Estate</option>
                                        <option value="Administration">Administration / Office Support</option>
                                        <option value="Research">Research / Science</option>
                                        <option value="Agriculture">Agriculture / Environment</option>
                                        <option value="Management">Strategic / Management</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* Monetary & Experience Spectrum */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-12">
                        <motion.section
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm hover:shadow-xl transition-all group"
                        >
                            <div className="flex items-center gap-5 mb-10">
                                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                                    <DollarSign size={24} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-xl font-black text-black uppercase tracking-tight">Monetary Spectrum</h3>
                            </div>
                            <div className="space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Base Lower (LPA)</label>
                                        <input
                                            name="minSalary"
                                            value={formData.minSalary}
                                            onChange={handleChange}
                                            placeholder="5.0"
                                            className="w-full bg-slate-50 border border-transparent focus:border-emerald-200 focus:bg-white text-black font-bold rounded-xl py-4 px-5 outline-none transition-all text-center placeholder:text-slate-300"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Base Upper (LPA)</label>
                                        <input
                                            name="maxSalary"
                                            value={formData.maxSalary}
                                            onChange={handleChange}
                                            placeholder="12.0"
                                            className="w-full bg-slate-50 border border-transparent focus:border-emerald-200 focus:bg-white text-black font-bold rounded-xl py-4 px-5 outline-none transition-all text-center placeholder:text-slate-300"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-emerald-50/50 rounded-2xl">
                                    <AlertCircle size={14} className="text-emerald-600 mt-1" />
                                    <p className="text-[10px] font-bold text-emerald-700 leading-relaxed uppercase tracking-tight">Updating these values will overwrite the existing compensation string.</p>
                                </div>
                            </div>
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm hover:shadow-xl transition-all group"
                        >
                            <div className="flex items-center gap-5 mb-10">
                                <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
                                    <Tag size={24} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-xl font-black text-black uppercase tracking-tight">Intellectual Range</h3>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target Seniority</label>
                                    <div className="relative">
                                        <select
                                            name="experienceLevel"
                                            value={formData.experienceLevel}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-transparent focus:border-purple-200 focus:bg-white text-black font-bold rounded-xl py-4 px-5 outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option>Entry Level</option>
                                            <option>Mid-Senior Level</option>
                                            <option>Senior Level</option>
                                            <option>Expert/Principal</option>
                                        </select>
                                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Skill Identifiers (Comma Separated)</label>
                                    <input
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleChange}
                                        placeholder="React, AWS Architecture, Node.js"
                                        className="w-full bg-slate-50 border border-transparent focus:border-purple-200 focus:bg-white text-black font-bold rounded-xl py-4 px-5 outline-none transition-all placeholder:text-slate-300"
                                    />
                                </div>
                            </div>
                        </motion.section>
                    </div>

                    {/* Operational Details */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-slate-100 rounded-[3rem] p-10 lg:p-16 shadow-sm hover:shadow-xl transition-all group"
                    >
                        <div className="flex items-center gap-6 mb-12">
                            <div className="p-5 bg-orange-50 text-orange-600 rounded-3xl group-hover:bg-orange-600 group-hover:text-white transition-all">
                                <FileText size={28} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-black">Operational Context</h2>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Refining the narrative</p>
                            </div>
                        </div>

                        <div className="space-y-12">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Comprehensive Mandate *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="8"
                                    placeholder="Articulate the vision, impact, and daily operational reality of this role..."
                                    className="w-full bg-slate-50 border border-transparent focus:border-black/5 focus:bg-white text-black font-bold rounded-3xl py-6 px-8 outline-none transition-all placeholder:text-slate-300 resize-none leading-relaxed"
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mandatory Competencies</label>
                                <textarea
                                    name="requirements"
                                    value={formData.requirements}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Enumerate non-negotiable certifications, academic credentials, or specific technical experience..."
                                    className="w-full bg-slate-50 border border-transparent focus:border-black/5 focus:bg-white text-black font-bold rounded-3xl py-6 px-8 outline-none transition-all placeholder:text-slate-300 resize-none leading-relaxed"
                                />
                            </div>
                        </div>
                    </motion.section>

                    {/* Media Acquisition */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-slate-100 rounded-[3rem] p-10 lg:p-16 shadow-sm hover:shadow-xl transition-all group"
                    >
                        <div className="flex items-center gap-6 mb-12">
                            <div className="p-5 bg-pink-50 text-pink-600 rounded-3xl group-hover:bg-pink-600 group-hover:text-white transition-all">
                                <Upload size={28} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-black">Visual Asset</h2>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Optional brand enrichment</p>
                            </div>
                        </div>

                        <div className="border-4 border-dashed border-slate-50 rounded-[2.5rem] p-20 text-center hover:border-black/10 hover:bg-slate-50/50 transition-all cursor-pointer relative group/upload">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            <div className="space-y-6">
                                <div className="w-24 h-24 bg-white border border-slate-100 rounded-full flex items-center justify-center mx-auto shadow-xl group-hover/upload:scale-110 group-hover/upload:rotate-6 transition-all duration-500">
                                    <Upload size={36} className="text-black" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <p className="text-xl font-black text-black">{formData.poster ? formData.poster.name : 'Update Role Canvas'}</p>
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Uploading a new asset will replace the existing one.</p>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-10 border-t border-gray-100">
                        <Link
                            to="/recruiter/jobs"
                            className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm transition-all text-center border border-gray-300"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-10 py-3 bg-black hover:bg-gray-800 text-white rounded-lg font-semibold text-sm shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 group"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    Update Job
                                    <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                                    </>
                                )}
                            </button>
                    </div>
                </form>
            </main>
        </RecruiterLayout>
    )
}

// Minimalist ChevronDown helper for custom selects
const ChevronDown = ({ className, size }) => (
    <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="m6 9 6 6 6-6" />
    </svg>
)

export default EditJob
