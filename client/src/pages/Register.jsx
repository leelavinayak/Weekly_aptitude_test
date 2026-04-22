import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    UserPlus, 
    User as UserIcon, 
    Mail, 
    Lock, 
    Settings, 
    Loader2, 
    ShieldCheck, 
    GraduationCap, 
    Sparkles,
    ChevronRight,
    ArrowLeft,
    School
} from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
    const location = useLocation();
    const intendedRole = location.state?.role || 'student';

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        profilePic: '',
        role: intendedRole,
        collegeId: '',
        collegeName: '',
        branch: '',
        year: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = () => {
        if (step === 1) {
            if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
                return toast.error('Please fill all required fields');
            }
            if (formData.password !== formData.confirmPassword) {
                return toast.error('Passwords do not match');
            }
            if (formData.role === 'admin') {
                handleSubmit();
            } else {
                setStep(2);
            }
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await register(formData);
            
            if (res.isPendingVerification) {
                toast.success('Admin registered! Please verify OTP sent to email.');
                navigate('/verify-admin', { state: { email: formData.email } });
            } else {
                toast.success('Welcome to the portal!');
                if (res.role === 'admin') navigate('/admin/dashboard');
                else navigate('/student/home');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed';
            toast.error(msg);
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-6">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-xl relative z-10">
                {/* Branding */}
                <div className="flex flex-col items-center mb-10 animate-fade-in">
                    <div className="bg-blue-600 p-4 rounded-2xl shadow-xl shadow-blue-100 mb-4 rotate-3">
                        <Sparkles className="text-white" size={32} />
                    </div>
                    <span className="text-3xl font-black text-slate-800 tracking-tight">Quiz<span className="text-blue-600">Craft</span></span>
                </div>

                <div className="bg-white p-10 md:p-12 rounded-[3rem] shadow-xl shadow-slate-200/60 border border-slate-100 animate-scale-up">
                    <div className="mb-10 text-center">
                        <div className="flex items-center justify-center space-x-2 mb-6">
                            <span className={`h-1.5 rounded-full transition-all duration-500 ${step === 1 ? 'w-8 bg-blue-600' : 'w-4 bg-slate-100'}`}></span>
                            {formData.role === 'student' && (
                                <span className={`h-1.5 rounded-full transition-all duration-500 ${step === 2 ? 'w-8 bg-blue-600' : 'w-4 bg-slate-100'}`}></span>
                            )}
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Create Account</h1>
                        <p className="text-slate-500 font-medium text-sm">
                            {step === 1 ? 'Tell us about yourself.' : 'Academic profile setup.'}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-600 p-4 mb-8 rounded-r-xl shadow-sm">
                            <p className="font-bold text-sm tracking-tight">{error}</p>
                        </div>
                    )}

                    <form onSubmit={step === 2 || formData.role === 'admin' ? handleSubmit : (e) => e.preventDefault()} className="space-y-6">
                        {step === 1 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                                        <div className="relative group">
                                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300 group-focus-within:text-blue-600 transition-colors">
                                                <UserIcon size={18} />
                                            </span>
                                            <input
                                                name="name"
                                                type="text"
                                                required
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-700"
                                                placeholder="Enter student name"
                                                value={formData.name}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Communication Email</label>
                                        <div className="relative group">
                                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300 group-focus-within:text-blue-600 transition-colors">
                                                <Mail size={18} />
                                            </span>
                                            <input
                                                name="email"
                                                type="email"
                                                required
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-700"
                                                placeholder="210M1A0537@vemu.org"
                                                value={formData.email}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secret Password</label>
                                        <div className="relative group">
                                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300 group-focus-within:text-blue-600 transition-colors">
                                                <Lock size={18} />
                                            </span>
                                            <input
                                                name="password"
                                                type="password"
                                                required
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-700"
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Secret</label>
                                        <div className="relative group">
                                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300 group-focus-within:text-blue-600 transition-colors">
                                                <Lock size={18} />
                                            </span>
                                            <input
                                                name="confirmPassword"
                                                type="password"
                                                required
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-700"
                                                placeholder="••••••••"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Role</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, role: 'student' })}
                                                className={`flex items-center justify-center space-x-2 p-4 rounded-2xl border-2 transition-all ${formData.role === 'student' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'}`}
                                            >
                                                <GraduationCap size={18} />
                                                <span className="font-bold text-sm">Student</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, role: 'admin' })}
                                                className={`flex items-center justify-center space-x-2 p-4 rounded-2xl border-2 transition-all ${formData.role === 'admin' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'}`}
                                            >
                                                <ShieldCheck size={18} />
                                                <span className="font-bold text-sm">Admin</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black flex items-center justify-center space-x-3 hover:bg-blue-600 transition-all active:scale-[0.98] shadow-xl shadow-slate-200 mt-10"
                                >
                                    <span>{formData.role === 'admin' ? 'Finalize Registration' : 'Next Step'}</span>
                                    <ChevronRight size={20} />
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-scale-up">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Institutional Entity</label>
                                        <div className="relative group">
                                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300 group-focus-within:text-blue-600 transition-colors">
                                                <School size={18} />
                                            </span>
                                            <input
                                                name="collegeName"
                                                type="text"
                                                required
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-700"
                                                placeholder="Enter your Institute Name"
                                                value={formData.collegeName}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identification ID</label>
                                        <input
                                            name="collegeId"
                                            type="text"
                                            required
                                            className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-700"
                                            placeholder="210M1A0537"
                                            value={formData.collegeId}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Year of Study</label>
                                        <select
                                            name="year"
                                            required
                                            className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-700"
                                            value={formData.year}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Year</option>
                                            <option value="1st Year">1st year</option>
                                            <option value="2nd Year">2nd year</option>
                                            <option value="3rd Year">3rd year</option>
                                            <option value="4th Year">4th year</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Specialization</label>
                                        <input
                                            name="branch"
                                            type="text"
                                            required
                                            className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-700"
                                            placeholder="e.g. Computer Science"
                                            value={formData.branch}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row gap-4 mt-10">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex-1 bg-slate-50 text-slate-400 rounded-2xl py-4 font-black flex items-center justify-center space-x-3 hover:bg-slate-100 transition-all"
                                    >
                                        <ArrowLeft size={20} />
                                        <span>Back</span>
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-[2] bg-slate-900 text-white rounded-2xl py-4 font-black flex items-center justify-center space-x-3 hover:bg-blue-600 transition-all active:scale-[0.98] shadow-xl shadow-slate-200"
                                    >
                                        {loading ? (
                                            <Loader2 className="animate-spin" size={24} />
                                        ) : (
                                            <>
                                                <span>Finalize Account</span>
                                                <UserPlus size={20} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-slate-400 font-bold text-sm">
                            Already part of the network?{' '}
                            <Link to="/login" className="text-blue-600 hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
