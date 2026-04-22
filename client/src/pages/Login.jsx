import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, User as UserIcon, Lock, Loader2, KeyRound, Sparkles, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(email, password);
            toast.success(`Welcome back, ${user.name}!`);
            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/student/home');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Invalid credentials';
            if (err.response?.data?.isPendingVerification) {
                toast.error('Account not verified. Verifying OTP...');
                navigate('/verify-admin', { state: { email } });
            } else {
                toast.error(msg);
                setError(msg);
            }
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

            <div className="w-full max-w-md relative z-10">
                {/* Branding */}
                <div className="flex flex-col items-center mb-10 animate-fade-in">
                    <div className="bg-blue-600 p-4 rounded-2xl shadow-xl shadow-blue-100 mb-4 rotate-3">
                        <Sparkles className="text-white" size={32} />
                    </div>
                    <span className="text-3xl font-black text-slate-800 tracking-tight">Quiz<span className="text-blue-600">Craft</span></span>
                </div>

                <div className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 animate-scale-up">
                    <div className="mb-10 text-center">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome Back</h1>
                        <p className="text-slate-500 font-medium text-sm">Secure access to your intelligence portal.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-600 p-4 mb-8 rounded-r-xl shadow-sm flex items-center space-x-3">
                            <ShieldCheck size={20} className="shrink-0" />
                            <p className="font-bold text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Email</label>
                            <div className="relative group">
                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300 group-focus-within:text-blue-600 transition-colors">
                                    <UserIcon size={18} />
                                </span>
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-700 placeholder:text-slate-300"
                                    placeholder="210M1A0537@vemu.org"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Access Key</label>
                                <Link 
                                    to="/forgot-password" 
                                    className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
                                >
                                    Recovery
                                </Link>
                            </div>
                            <div className="relative group">
                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300 group-focus-within:text-blue-600 transition-colors">
                                    <Lock size={18} />
                                </span>
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-700 placeholder:text-slate-300"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black flex items-center justify-center space-x-3 hover:bg-blue-600 transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-slate-200"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <>
                                    <span>Initialize Portal</span>
                                    <LogIn size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-slate-400 font-bold text-sm">
                            New to the systems?{' '}
                            <Link to="/register" className="text-blue-600 hover:underline">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
