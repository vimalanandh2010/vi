import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Send, X, Upload, MapPin, Briefcase, DollarSign, Tag, FileText, AlertCircle, Sparkles, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import RecruiterLayout from '../../components/RecruiterLayout'
import axiosClient from '../../api/axiosClient'
import { toast } from 'react-toastify'
import LocationAutocomplete from '../../components/Maps/LocationAutocomplete'

const PostJob = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
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

    React.useEffect(() => {
        const checkVerification = async () => {
            try {
                const response = await axiosClient.get('companies/my-company')
                const company = response
                if (!company) {
                    toast.error('Please complete your company profile before posting a job.')
                    navigate('/recruiter/company-profile')
                }
            } catch (err) {
                console.error('[PostJob] Verification check failed:', err)
                if (err.response?.status === 404 || err.response?.status === 403) {
                    toast.error('Please complete your company profile before posting a job.')
                    navigate('/recruiter/company-profile')
                }
            }
        }
        checkVerification()
    }, [navigate])

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

            await axiosClient.post('jobs', postData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            toast.success('Position successfully launched!')
            navigate('/recruiter/dashboard')
        } catch (err) {
            console.error('[PostJob] Submit Error:', err)
            toast.error(err.response?.data?.message || err.message || 'Failed to post job')
        } finally {
            setLoading(false)
        }
    }

    return (
        <RecruiterLayout>
            <main className="p-4 sm:p-8 md:p-12 lg:p-16 max-w-5xl mx-auto bg-white min-h-full">
                {/* Minimalist Header */}
                <header className="mb-12">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        Launch a New Position
                    </h1>
                    <p className="text-gray-600 text-base md:text-lg">Deploy high-performance roles to our elite network of candidates.</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-12 pb-24">
                    {/* Primary Role Architecture */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all relative"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-4 bg-blue-600 text-white rounded-xl shadow-md">
                                <Briefcase size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Role Architecture</h2>
                                <p className="text-xs text-gray-500 font-semibold mt-1">Foundational Parameters</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-600 ml-1">Professional Title *</label>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Senior Logic Architect"
                                    className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white text-gray-900 font-medium rounded-xl py-3 px-4 outline-none transition-all placeholder:text-gray-400"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-600 ml-1">Deployment Location *</label>
                                <LocationAutocomplete
                                    value={formData.location}
                                    onChange={(value) => setFormData({ ...formData, location: value })}
                                    onPlaceSelect={(data) => {
                                        setFormData({
                                            ...formData,
                                            location: data.address,
                                            coordinates: data.coordinates // Store coordinates for future use
                                        });
                                    }}
                                    placeholder="City, State, or Country"
                                    className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white text-gray-900 font-medium rounded-xl py-3 pl-14 pr-4 outline-none transition-all placeholder:text-gray-400"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-600 ml-1">Engagement Framework</label>
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
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-600 ml-1">Domain Classification</label>
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
                            className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                    <DollarSign size={22} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Monetary Spectrum</h3>
                            </div>
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-600">Base Lower (LPA)</label>
                                        <input
                                            name="minSalary"
                                            value={formData.minSalary}
                                            onChange={handleChange}
                                            placeholder="5.0"
                                            className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white text-gray-900 font-medium rounded-lg py-3 px-4 outline-none transition-all text-center placeholder:text-gray-400"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-600">Base Upper (LPA)</label>
                                        <input
                                            name="maxSalary"
                                            value={formData.maxSalary}
                                            onChange={handleChange}
                                            placeholder="12.0"
                                            className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white text-gray-900 font-medium rounded-lg py-3 px-4 outline-none transition-all text-center placeholder:text-gray-400"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-emerald-50/50 rounded-2xl">
                                    <AlertCircle size={14} className="text-emerald-600 mt-1" />
                                    <p className="text-[10px] font-bold text-emerald-700 leading-relaxed uppercase tracking-tight">Figures are analyzed as annual compensation in Lakhs (INR) unless specified otherwise.</p>
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
                                    <p className="text-xl font-black text-black">{formData.poster ? formData.poster.name : 'Ingest Role Canvas'}</p>
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Dynamic imagery increases engagement by up to 40%</p>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* Transactional Actions */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-10 border-t border-slate-50">
                        <Link
                            to="/recruiter/jobs"
                            className="px-6 sm:px-10 py-4 sm:py-5 bg-slate-50 hover:bg-black hover:text-white text-black rounded-[1.5rem] sm:rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all text-center"
                        >
                            Cancel Mission
                        </Link>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-16 py-6 bg-black hover:bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 group"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    Deployment Active
                                    <Sparkles size={18} className="group-hover:animate-pulse" />
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

export default PostJob
