import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Send, X, Upload, BookOpen, Layers, FileText, Image as ImageIcon, Film } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import axiosClient from '../../api/axiosClient'

const PostCourse = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        level: 'Beginner',
        thumbnail: null,
        content: null
    })

    React.useEffect(() => {
        const checkVerification = async () => {
            try {
                const response = await axiosClient.get('companies/my-company')
                const company = response
                if (!company) {
                    toast.error('Please complete your company profile before posting a course.')
                    navigate('/recruiter/company-profile')
                }
            } catch (err) {
                console.error('[PostCourse] Verification check failed:', err)
                if (err.response?.status === 404 || err.response?.status === 403) {
                    toast.error('Please complete your company profile before posting a course.')
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
        const { name, files } = e.target
        if (files && files[0]) {
            setFormData(prev => ({ ...prev, [name]: files[0] }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const postData = new FormData()

            Object.keys(formData).forEach(key => {
                if (formData[key] !== null) {
                    postData.append(key, formData[key])
                }
            })

            // axiosClient will handle the recruiterToken and base URL automatically
            await axiosClient.post('courses', postData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            toast.success('Course published successfully!')
            navigate('/recruiter/dashboard')
        } catch (err) {
            console.error('[PostCourse] Submit Error:', err)
            toast.error(err.response?.data?.message || err.message || 'Failed to post course')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-4 mb-4"
                    >
                        <div className="p-3 bg-blue-600/20 rounded-2xl">
                            <BookOpen className="text-blue-400" size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white tracking-tight">Post a New Course</h1>
                            <p className="text-slate-400">Share your knowledge with thousands of eager learners.</p>
                        </div>
                    </motion.div>
                </header>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <FileText className="text-blue-400" size={24} />
                            <h2 className="text-xl font-bold text-white">Course Overview</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white ml-1">Course Title *</label>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g., Advanced React Patterns & Hooks"
                                    className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    required
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white ml-1">Difficulty Level</label>
                                    <div className="relative">
                                        <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <select
                                            name="level"
                                            value={formData.level}
                                            onChange={handleChange}
                                            className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
                                        >
                                            <option>Beginner</option>
                                            <option>Intermediate</option>
                                            <option>Advanced</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white ml-1">Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="6"
                                    placeholder="What will students learn in this course?"
                                    className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    required
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Media Uploads */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <ImageIcon className="text-purple-400" size={24} />
                                <h2 className="text-xl font-bold text-white">Course Thumbnail</h2>
                            </div>
                            <div className="border-2 border-dashed border-slate-700/50 rounded-2xl p-6 text-center hover:border-purple-500/50 hover:bg-slate-800/30 transition-all cursor-pointer relative group">
                                <input
                                    type="file"
                                    name="thumbnail"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <div className="space-y-3">
                                    <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                        <Upload size={24} className="text-purple-400" />
                                    </div>
                                    <p className="text-sm text-slate-300 font-medium">
                                        {formData.thumbnail ? formData.thumbnail.name : 'Upload Thumbnail'}
                                    </p>
                                    <p className="text-xs text-slate-500">PNG, JPG up to 2MB</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <Film className="text-pink-400" size={24} />
                                <h2 className="text-xl font-bold text-white">Course Content</h2>
                            </div>
                            <div className="border-2 border-dashed border-slate-700/50 rounded-2xl p-6 text-center hover:border-pink-500/50 hover:bg-slate-800/30 transition-all cursor-pointer relative group">
                                <input
                                    type="file"
                                    name="content"
                                    accept="video/*,application/pdf"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <div className="space-y-3">
                                    <div className="w-12 h-12 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                        <Upload size={24} className="text-pink-400" />
                                    </div>
                                    <p className="text-sm text-slate-300 font-medium">
                                        {formData.content ? formData.content.name : 'Upload Video/PDF'}
                                    </p>
                                    <p className="text-xs text-slate-500">MP4, PDF up to 100MB</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

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
                            {loading ? 'Publishing...' : (
                                <>
                                    <Send size={20} />
                                    Publish Course
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default PostCourse
