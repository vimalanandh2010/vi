import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Send, X, Upload, MapPin, Briefcase, DollarSign, Tag, FileText } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

import axiosClient from '../../api/axiosClient'

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
                if (!company || company.verificationStatus !== 'verified') {
                    alert('Your company must be verified to post jobs.')
                    navigate('/recruiter/dashboard')
                }
            } catch (err) {
                console.error('[PostJob] Verification check failed:', err)
                if (err.response?.status === 404 || err.response?.status === 403) {
                    alert('Please complete your company profile before posting a job.')
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

            // Construct salary string from minSalary and maxSalary
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

            // Add the constructed salary string
            if (salaryString) {
                postData.append('salary', salaryString)
            }

            // axiosClient will handle the recruiterToken and base URL automatically
            await axiosClient.post('jobs', postData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            alert('Job posted successfully!')
            navigate('/recruiter/dashboard')
        } catch (err) {
            console.error('[PostJob] Submit Error:', err)
            console.error('[PostJob] Full Error:', err.response || err)
            alert(err.response?.data?.message || err.message || 'Failed to post job')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold text-white mb-2"
                    >
                        Create a Job Opportunity
                    </motion.h1>
                    <p className="text-slate-400">Reach thousands of qualified candidates by posting your job listing today.</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <Briefcase className="text-blue-400" size={24} />
                            <h2 className="text-xl font-bold text-white">Role Details</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white ml-1">Job Title *</label>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g., Senior Software Engineer"
                                    className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white ml-1">Location *</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="City, Remote, or Hybrid"
                                        className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white ml-1">Engagement Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
                                >
                                    <option>Full Time</option>
                                    <option>Part Time</option>
                                    <option>Internship</option>
                                    <option>Freelance</option>
                                    <option>Contract</option>
                                    <option>Remote</option>
                                    <option>Hybrid</option>
                                </select>
                            </div>
                        </div>
                    </motion.div>

                    {/* Salary & Requirements */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <DollarSign className="text-green-400" size={24} />
                                <h2 className="text-xl font-bold text-white">Compensation</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white">Min Salary</label>
                                        <input
                                            name="minSalary"
                                            value={formData.minSalary}
                                            onChange={handleChange}
                                            placeholder="5,00,000"
                                            className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white">Max Salary</label>
                                        <input
                                            name="maxSalary"
                                            value={formData.maxSalary}
                                            onChange={handleChange}
                                            placeholder="12,00,000"
                                            className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 italic">* All figures in local currency (e.g., INR)</p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <Tag className="text-purple-400" size={24} />
                                <h2 className="text-xl font-bold text-white">Requirements</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white">Job Category</label>
                                    <select
                                        name="category"
                                        value={formData.category || 'IT'}
                                        onChange={handleChange}
                                        className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none"
                                    >
                                        <option value="IT">IT / Technical</option>
                                        <option value="Non-IT">Non-IT / Management / Others</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white">Experience Level</label>
                                    <select
                                        name="experienceLevel"
                                        value={formData.experienceLevel}
                                        onChange={handleChange}
                                        className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none"
                                    >
                                        <option>Entry Level</option>
                                        <option>Mid-Senior Level</option>
                                        <option>Senior Level</option>
                                        <option>Expert/Principal</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white">Skills/Tags (comma separated)</label>
                                    <input
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleChange}
                                        placeholder="React, AWS, Node.js"
                                        className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Description */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <FileText className="text-orange-400" size={24} />
                            <h2 className="text-xl font-bold text-white">Job Description</h2>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">Detailed Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="6"
                                    placeholder="Tell candidates about the role, team, and company culture..."
                                    className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">Key Requirements (comma separated)</label>
                                <textarea
                                    name="requirements"
                                    value={formData.requirements}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Specify must-have certifications, degrees, or years of specific experience..."
                                    className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Poster Upload */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <Upload className="text-pink-400" size={24} />
                            <h2 className="text-xl font-bold text-white">Job Image / Flyer (Optional)</h2>
                        </div>
                        <div className="border-2 border-dashed border-slate-700/50 rounded-2xl p-12 text-center hover:border-pink-500/50 hover:bg-slate-800/30 transition-all cursor-pointer relative group">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="space-y-4">
                                <div className="w-16 h-16 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                    <Upload size={32} className="text-pink-400" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-white">{formData.poster ? formData.poster.name : 'Click to upload job banner'}</p>
                                    <p className="text-slate-400 text-sm">PNG, JPG up to 5MB</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 pt-8">
                        <button
                            type="button"
                            onClick={() => navigate('/recruiter/dashboard')}
                            className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-12 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-bold shadow-xl shadow-blue-900/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? 'Posting...' : (
                                <>
                                    <Send size={20} />
                                    Launch Job
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default PostJob
