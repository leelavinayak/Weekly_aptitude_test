import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User as UserIcon, Mail, Link as LinkIcon, Save, Loader2, ShieldCheck, PieChart, LogOut, Pencil, X, Building2, GraduationCap, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        profilePic: user.profilePic || '',
        collegeId: user.collegeId || '',
        branch: user.branch || '',
        year: user.year || '',
        collegeName: user.collegeName || ''
    });
    const [loading, setLoading] = useState(false);

    const handleCancel = () => {
        setFormData({
            name: user.name,
            email: user.email,
            profilePic: user.profilePic || '',
            collegeId: user.collegeId || '',
            branch: user.branch || '',
            year: user.year || '',
            collegeName: user.collegeName || ''
        });
        setIsEditing(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.put('/auth/profile', formData);
            updateUser(data);
            setIsEditing(false);
            toast.success('Profile updated successfully!');
        } catch (err) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (disabled) =>
        `w-full px-4 py-3 rounded-xl border font-medium text-slate-700 text-base outline-none transition-all duration-200 ${
            disabled
                ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-white border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
        }`;

    return (
        <div className="max-w-3xl mx-auto px-4 py-12 page-enter">

            {/* Page Header */}
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">My Profile</h1>
                    <p className="text-slate-400 text-sm font-medium mt-1 capitalize">{user.role} Account</p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
                    >
                        <Pencil size={16} />
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="flex items-center gap-2 bg-slate-100 text-slate-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all active:scale-95"
                        >
                            <X size={16} />
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-60"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Save Changes
                        </button>
                    </div>
                )}
            </div>

            {/* Main Card */}
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">

                {/* Profile Picture Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 pt-10 pb-16 relative">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-white shadow-lg absolute -bottom-10 left-8">
                        {user.profilePic ? (
                            <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-white flex items-center justify-center text-blue-600 text-3xl font-black">
                                {user.name.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-16 px-8 pb-8">
                    {/* Name & Role */}
                    <div className="mb-8">
                        <h2 className="text-xl font-black text-slate-800">{user.name}</h2>
                        <span className="inline-block mt-1 px-3 py-0.5 bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest rounded-full">
                            {user.role}
                        </span>
                    </div>

                    <div className="h-px bg-slate-100 mb-8" />

                    {/* Fields Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div className="md:col-span-2">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                            <input
                                type="text"
                                className={inputClass(!isEditing)}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Your full name"
                                disabled={!isEditing}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                            <input
                                type="email"
                                className={inputClass(!isEditing)}
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="210M1A0537@vemu.org"
                                disabled={!isEditing}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Profile Picture URL</label>
                            <input
                                type="text"
                                className={inputClass(!isEditing)}
                                value={formData.profilePic}
                                onChange={(e) => setFormData({ ...formData, profilePic: e.target.value })}
                                placeholder="https://..."
                                disabled={!isEditing}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">College ID</label>
                            <input
                                type="text"
                                className={inputClass(!isEditing)}
                                value={formData.collegeId}
                                onChange={(e) => setFormData({ ...formData, collegeId: e.target.value })}
                                placeholder="210M1A0537"
                                disabled={!isEditing}
                            />
                        </div>

                        {user.role !== 'admin' && (
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Academic Year</label>
                                <select
                                    className={inputClass(!isEditing)}
                                    value={formData.year}
                                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                    disabled={!isEditing}
                                >
                                    <option value="">Select Year</option>
                                    <option value="1st Year">1st Year</option>
                                    <option value="2nd Year">2nd Year</option>
                                    <option value="3rd Year">3rd Year</option>
                                    <option value="4th Year">4th Year</option>
                                    <option value="Associate">Associate / Other</option>
                                </select>
                            </div>
                        )}

                        <div className={user.role !== 'admin' ? '' : 'md:col-span-2'}>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">College / University</label>
                            <input
                                type="text"
                                className={inputClass(!isEditing)}
                                value={formData.collegeName}
                                onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                                placeholder="Institution name"
                                disabled={!isEditing}
                            />
                        </div>

                        <div className={user.role !== 'admin' ? 'md:col-span-2' : ''}>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                                {user.role === 'admin' ? 'Department' : 'Branch'}
                            </label>
                            <input
                                type="text"
                                className={inputClass(!isEditing)}
                                value={formData.branch}
                                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                placeholder={user.role === 'admin' ? 'e.g. IT Department' : 'e.g. Computer Science'}
                                disabled={!isEditing}
                            />
                        </div>

                    </div>

                    {/* Sign Out */}
                    <div className="mt-10 pt-8 border-t border-slate-100 flex justify-end">
                        <button
                            type="button"
                            onClick={() => {
                                localStorage.removeItem('token');
                                localStorage.removeItem('userInfo');
                                window.location.href = '/';
                            }}
                            className="flex items-center gap-2 text-red-400 hover:text-red-600 text-sm font-bold transition-colors"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Profile;
