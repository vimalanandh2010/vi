import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Building, MapPin, Globe, Save, LogOut, Camera, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCompany } from '../../context/CompanyContext'
import { toast } from 'react-toastify'
import axiosClient from '../../api/axiosClient' // Use axiosClient
import VerificationBadge from '../../components/Common/VerificationBadge'

const RecruiterProfile = () => {
    const { user, logout, updateUser } = useAuth()
    const { company, fetchCompany } = useCompany()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const fileInputRef = React.useRef(null)

    // Initial state based on User AND Company
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        companyName: '',
        location: '',
        website: '',
        aboutMe: ''
    })

    // Auto-fill when company or user data changes
    useEffect(() => {
        setFormData({
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            companyName: company?.name || user?.companyName || '',
            location: company?.location || user?.location || '',
            website: company?.website || user?.website || '',
            aboutMe: company?.about || user?.aboutMe || ''
        })
    }, [user, company])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            // 1. Update User Profile (First Name, Last Name)
            const userResponse = await axiosClient.put('auth/update', {
                firstName: formData.firstName,
                lastName: formData.lastName
            })

            // 2. Update Company Profile (Company Name, Location, Website, About)
            await axiosClient.put('companies/update', {
                name: formData.companyName,
                location: formData.location,
                website: formData.website,
                about: formData.aboutMe,
                companyType: company?.companyType || 'Startup',
                size: company?.size || '1-10'
            })

            // Update global auth state
            updateUser('employer', {
                firstName: formData.firstName,
                lastName: formData.lastName
            });

            await fetchCompany();
            toast.success('Profile and Company updated successfully')
            navigate('/recruiter/dashboard')
        } catch (error) {
            console.error('Update Profile Error:', error)
            toast.error(error.response?.data?.message || 'Error updating profile')
        } finally {
            setLoading(false)
        }
    }

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return;

        const formData = new FormData()
        formData.append('photo', file)

        try {
            setLoading(true)
            const res = await axiosClient.post('auth/photo', formData)
            updateUser('employer', { photoUrl: res.photoUrl })
            toast.success('Photo updated successfully')
        } catch (err) {
            toast.error('Failed to upload photo')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-bold tracking-tight">Profile Settings</h1>
                            {company && (
                                <VerificationBadge
                                    level={company.verificationLevel}
                                    status={company.verificationStatus}
                                />
                            )}
                        </div>
                        <p className="text-slate-400 mt-2">Manage your recruiter profile and company information.</p>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 px-6 py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-xl font-semibold transition-all border border-red-500/20 active:scale-95"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </header>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8"
                >
                    <div className="flex flex-col items-center mb-10">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-3xl bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-slate-700 group-hover:border-blue-500 transition-all duration-500 shadow-2xl">
                                {user?.photoUrl ? (
                                    <img src={user.photoUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={48} className="text-slate-600" />
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-3 -right-3 p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-xl transition-all active:scale-90"
                            >
                                <Camera size={20} />
                            </button>
                            <input
                                type="file"
                                hidden
                                ref={fileInputRef}
                                onChange={handlePhotoUpload}
                                accept="image/*"
                            />
                        </div>
                        <h3 className="text-xl font-bold mt-6">{user?.firstName} {user?.lastName}</h3>
                        <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mt-1">Professional Recruiter</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">First Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Last Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Company Name</label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Company Website</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="url"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">About Company / Professional Bio</label>
                            <textarea
                                name="aboutMe"
                                value={formData.aboutMe}
                                onChange={handleChange}
                                rows="4"
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            ></textarea>
                        </div>

                        <div className="pt-4 flex flex-col-reverse md:flex-row items-center justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/recruiter/dashboard')}
                                className="w-full md:w-auto px-6 py-4 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2"
                            >
                                Already Added? Go to Dashboard
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Save size={18} />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    )
}

export default RecruiterProfile
