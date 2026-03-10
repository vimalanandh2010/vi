import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Building, MapPin, Globe, Save, LogOut, Camera, X, ChevronRight, Briefcase, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCompany } from '../../context/CompanyContext'
import { toast } from 'react-toastify'
import axiosClient from '../../api/axiosClient'
import VerificationBadge from '../../components/Common/VerificationBadge'
import RecruiterLayout from '../../components/RecruiterLayout'

const RecruiterProfile = () => {
    const { user, logout, updateUser } = useAuth()
    const { company, fetchCompany } = useCompany()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const fileInputRef = React.useRef(null)

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        companyName: '',
        location: '',
        website: '',
        aboutMe: ''
    })

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
            const userResponse = await axiosClient.put('auth/update', {
                firstName: formData.firstName,
                lastName: formData.lastName
            })

            await axiosClient.put('companies/update', {
                name: formData.companyName,
                location: formData.location,
                website: formData.website,
                about: formData.aboutMe,
                companyType: company?.companyType || 'Startup',
                size: company?.size || '1-10'
            })

            updateUser('employer', {
                firstName: formData.firstName,
                lastName: formData.lastName
            });

            await fetchCompany();
            toast.success('Professional identity synchronized')
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

        const uploadData = new FormData()
        uploadData.append('photo', file)

        try {
            setLoading(true)
            const res = await axiosClient.post('auth/photo', uploadData)
            updateUser('employer', { photoUrl: res.photoUrl })
            toast.success('Avatar updated')
        } catch (err) {
            toast.error('Failed to upload photo')
        } finally {
            setLoading(false)
        }
    }

    return (
        <RecruiterLayout>
            <main className="p-4 sm:p-8 md:p-12 lg:p-16 max-w-5xl mx-auto bg-white min-h-full">
                {/* Elite Header */}
                <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-20">
                    <div>
                        <div className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                            User Control <ChevronRight size={12} /> Identity Management
                        </div>
                        <div className="flex items-center gap-6 mb-4">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-black tracking-tighter">
                                Professional <br />Profile
                            </h1>
                            {company && (
                                <div className="mt-2">
                                    <VerificationBadge
                                        level={company.verificationLevel}
                                        status={company.verificationStatus}
                                    />
                                </div>
                            )}
                        </div>
                        <p className="text-slate-400 text-xl font-medium tracking-tight">Configure your executive presence and organizational links.</p>
                    </div>
                    <button
                        onClick={logout}
                        className="group flex items-center gap-3 px-6 sm:px-10 py-4 sm:py-5 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 rounded-[1.5rem] sm:rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all border border-red-200 shadow-sm"
                    >
                        Deactivate Session
                        <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Left Col: Avatar & Quick Info */}
                    <aside className="lg:col-span-4 space-y-12">
                        <section className="bg-white border border-slate-100 rounded-[3.5rem] p-12 text-center shadow-sm relative group overflow-hidden">
                            <div className="relative z-10">
                                <div className="relative inline-block mb-10 group/avatar">
                                    <div className="w-40 h-40 rounded-[3rem] bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100 shadow-2xl transition-all duration-700 group-hover/avatar:scale-105 group-hover/avatar:-rotate-3">
                                        {user?.photoUrl ? (
                                            <img src={user.photoUrl} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={64} className="text-slate-200" />
                                        )}
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute -bottom-4 -right-4 p-5 bg-black hover:bg-gray-800 text-white rounded-[1.5rem] shadow-2xl transition-all hover:scale-110 active:scale-90"
                                    >
                                        <Camera size={24} strokeWidth={2.5} />
                                    </button>
                                    <input
                                        type="file"
                                        hidden
                                        ref={fileInputRef}
                                        onChange={handlePhotoUpload}
                                        accept="image/*"
                                    />
                                </div>
                                <h3 className="text-3xl font-black text-black tracking-tight mb-2 leading-none">{user?.firstName} {user?.lastName}</h3>
                                <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3rem]">Verified Recruiter</p>

                                <div className="mt-12 pt-12 border-t border-slate-50 space-y-6">
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="p-3 bg-slate-50 rounded-xl text-slate-400">
                                            <ShieldCheck size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Trust Index</p>
                                            <p className="text-sm font-black text-black uppercase">High Fidelity</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="p-3 bg-slate-50 rounded-xl text-slate-400">
                                            <Briefcase size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Organization</p>
                                            <p className="text-sm font-black text-black uppercase leading-tight">{company?.name || 'Independent'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl opacity-50 -mr-16 -mt-16 group-hover:bg-blue-50 transition-colors duration-700" />
                        </section>
                    </aside>

                    {/* Right Col: Detailed Configuration */}
                    <div className="lg:col-span-8">
                        <motion.section
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white border border-slate-100 rounded-[3.5rem] p-12 lg:p-16 shadow-sm"
                        >
                            <form onSubmit={handleSubmit} className="space-y-12">
                                <div className="space-y-10">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-1.5 h-6 bg-black rounded-full" />
                                        <h3 className="text-lg font-black text-black uppercase tracking-tight">Identity Parameters</h3>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Given Name</label>
                                            <div className="relative">
                                                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-50 border border-transparent focus:border-black/5 focus:bg-white text-black font-bold rounded-2xl py-5 pl-14 pr-6 outline-none transition-all placeholder:text-slate-300"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Surname</label>
                                            <div className="relative">
                                                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-50 border border-transparent focus:border-black/5 focus:bg-white text-black font-bold rounded-2xl py-5 pl-14 pr-6 outline-none transition-all placeholder:text-slate-300"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-10 pt-12 border-t border-slate-50">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                                        <h3 className="text-lg font-black text-black uppercase tracking-tight">Organizational Link</h3>
                                    </div>
                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Corporate Entity</label>
                                            <div className="relative">
                                                <Building className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                <input
                                                    type="text"
                                                    name="companyName"
                                                    value={formData.companyName}
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-50 border border-transparent focus:border-black/5 focus:bg-white text-black font-bold rounded-2xl py-5 pl-14 pr-6 outline-none transition-all placeholder:text-slate-300"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">HQ Location</label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                    <input
                                                        type="text"
                                                        name="location"
                                                        value={formData.location}
                                                        onChange={handleChange}
                                                        className="w-full bg-slate-50 border border-transparent focus:border-black/5 focus:bg-white text-black font-bold rounded-2xl py-5 pl-14 pr-6 outline-none transition-all placeholder:text-slate-300"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Digital Presence (URL)</label>
                                                <div className="relative">
                                                    <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                    <input
                                                        type="url"
                                                        name="website"
                                                        value={formData.website}
                                                        onChange={handleChange}
                                                        className="w-full bg-slate-50 border border-transparent focus:border-black/5 focus:bg-white text-black font-bold rounded-2xl py-5 pl-14 pr-6 outline-none transition-all placeholder:text-slate-300"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Executive Mandate / About</label>
                                            <textarea
                                                name="aboutMe"
                                                value={formData.aboutMe}
                                                onChange={handleChange}
                                                rows="5"
                                                placeholder="Describe your organizational mission and talent strategy..."
                                                className="w-full bg-slate-50 border border-transparent focus:border-black/5 focus:bg-white text-black font-bold rounded-[2rem] py-6 px-8 outline-none transition-all placeholder:text-slate-300 resize-none leading-relaxed"
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-12 border-t border-slate-50 flex flex-col-reverse md:flex-row items-center justify-between gap-8">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/recruiter/dashboard')}
                                        className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-black transition-colors"
                                    >
                                        Revert to Dashboard
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full md:w-auto px-16 py-6 bg-black hover:bg-gray-800 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs transition-all shadow-[0_20px_40px_rgba(0,0,0,0.1)] active:scale-95 flex items-center justify-center gap-4 group"
                                    >
                                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} strokeWidth={2.5} />}
                                        Update Integrity
                                    </button>
                                </div>
                            </form>
                        </motion.section>
                    </div>
                </div>
            </main>
        </RecruiterLayout>
    )
}

export default RecruiterProfile
