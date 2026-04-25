import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShieldCheck,
    GraduationCap,
    ArrowRight,
    Sparkles,
    Zap,
    BarChart3,
    Lock,
    Globe,
    Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

const Landing = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    React.useEffect(() => {
        if (user) {
            if (user.role === 'admin') navigate('/admin/dashboard');
            else navigate('/student/home');
        }
    }, [user, navigate]);

    const features = [
        { icon: Cpu, title: 'AI-Driven', desc: 'Generate high-quality assessments in seconds using Gemini 1.5 Pro.' },
        { icon: Lock, title: 'Anti-Cheating', desc: 'Secure tab-locking and application monitoring to ensure integrity.' },
        { icon: BarChart3, title: 'Analytics', desc: 'Deep behavioral insights and automated performance reports.' }
    ];

    return (
        <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-600">
            {/* Navigation Header */}
            <header className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-white p-1 rounded-xl shadow-md border border-slate-100 overflow-hidden">
                            <img 
                                src="/weekly_aptitude_test_logo.png" 
                                alt="Logo" 
                                className="w-8 h-8 object-contain"
                            />
                        </div>
                        <span className="text-2xl font-black text-slate-800 tracking-tight">Weekly <span className="text-blue-600">Aptitude Test</span></span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-sm font-black text-slate-500 hover:text-blue-600 transition-colors px-4 py-2"
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="bg-slate-900 text-white text-sm font-black px-6 py-2.5 rounded-xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-100"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="pt-40 pb-20 overflow-hidden relative">
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-50 rounded-full blur-[120px] -mr-40 -mt-40 opacity-50 z-0"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[120px] -ml-40 -mb-40 opacity-50 z-0"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 text-center lg:text-left space-y-8">
                            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest animate-fade-in">
                                <Zap size={14} />
                                <span>Developed by Programmers club</span>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter animate-slide-right">
                                Assessments <br />
                                <span className="text-blue-600">Reimagined.</span>
                            </h1>
                            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0 animate-fade-in">
                                The enterprise-grade intelligence platform for academic certification.
                                Powered by AI, protected by extreme anti-cheating protocols.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 animate-fade-in">
                                <button
                                    onClick={() => navigate('/register')}
                                    className="w-full sm:w-auto bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-2xl shadow-blue-200 hover:scale-105 transition-all flex items-center justify-center group"
                                >
                                    <span>Create Free Account</span>
                                    <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" size={24} />
                                </button>
                                {/* <button className="w-full sm:w-auto px-10 py-5 border-2 border-slate-100 rounded-2xl font-black text-lg text-slate-600 hover:bg-slate-50 transition-all">
                                    Book Demo
                                </button> */}
                            </div>
                        </div>

                        <div className="flex-1 w-full relative animate-scale-up">
                            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl shadow-blue-200 border-4 border-white bg-slate-900 aspect-video flex items-center justify-center p-12 group/mock">
                                {/* Abstract CSS Mock Dashboard */}
                                <div className="w-full h-full relative">
                                    <div className="absolute top-0 left-0 w-1/2 h-4 bg-white/10 rounded-full mb-6"></div>
                                    <div className="flex gap-4 mt-8">
                                        <div className="w-1/3 h-32 bg-blue-600/20 rounded-2xl border border-blue-500/30 animate-pulse"></div>
                                        <div className="w-2/3 h-32 bg-white/5 rounded-2xl border border-white/10"></div>
                                    </div>
                                    <div className="mt-6 space-y-3">
                                        <div className="w-full h-2 bg-white/5 rounded-full"></div>
                                        <div className="w-4/5 h-2 bg-white/5 rounded-full"></div>
                                        <div className="w-2/3 h-2 bg-white/5 rounded-full"></div>
                                    </div>
                                    {/* Center Icon */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-blue-600 p-8 rounded-[2.5rem] shadow-2xl shadow-blue-500/40 rotate-12 group-hover/mock:rotate-0 transition-transform duration-700">
                                            <Cpu className="text-white" size={48} />
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute bottom-10 left-10 text-white z-10">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">System Verification</p>
                                    <p className="text-3xl font-black">Active Node</p>
                                </div>
                            </div>

                            {/* Floating Stats */}
                            <div className="absolute -top-10 -right-10 bg-white p-6 rounded-3xl shadow-2xl border border-slate-50 hidden lg:block animate-bounce-subtle">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-green-100 p-3 rounded-xl text-green-600">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</p>
                                        <p className="text-xl font-black text-slate-800">100% Secure</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Features Bar */}
            <section className="py-20 bg-slate-50 relative group">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {features.map((f, idx) => (
                            <div key={idx} className="flex items-start space-x-6">
                                <div className="bg-white p-4 rounded-2xl shadow-sm group-hover:shadow-xl transition-all duration-500">
                                    <f.icon className="text-blue-600" size={28} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 mb-2">{f.title}</h3>
                                    <p className="text-sm text-slate-500 font-bold leading-relaxed">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Role Select Section */}
            <section className="py-32 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">One Platform, <span className="text-blue-600">Two Pathways.</span></h2>
                        <p className="text-slate-500 font-bold max-w-2xl mx-auto">Select your identity to initialize access to the intelligence portal.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Admin Path */}
                        <div className="bg-white p-12 rounded-[3.5rem] border-2 border-slate-100 hover:border-blue-600 transition-all duration-500 group">
                            <div className="bg-slate-900 w-20 h-20 rounded-3xl flex items-center justify-center mb-8 rotate-6 group-hover:rotate-0 transition-transform">
                                <ShieldCheck className="text-white" size={40} />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 mb-4">Educational Admin</h3>
                            <p className="text-slate-500 font-bold mb-10 leading-relaxed">
                                Deploy assessments, monitor real-time behavioral data, and generate AI-driven insights for your institution.
                            </p>
                            <button
                                onClick={() => navigate('/register', { state: { role: 'admin' } })}
                                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center space-x-3 hover:bg-blue-600 transition-all"
                            >
                                <span>Initialize Admin Portal</span>
                                <ArrowRight size={20} />
                            </button>
                        </div>

                        {/* Student Path */}
                        <div className="bg-white p-12 rounded-[3.5rem] border-2 border-slate-100 hover:border-blue-600 transition-all duration-500 group">
                            <div className="bg-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center mb-8 -rotate-6 group-hover:rotate-0 transition-transform shadow-xl shadow-blue-100">
                                <GraduationCap className="text-white" size={40} />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 mb-4">Certified Student</h3>
                            <p className="text-slate-500 font-bold mb-10 leading-relaxed">
                                Join secure examination environments, track your performance history, and achieve global certification.
                            </p>
                            <button
                                onClick={() => navigate('/register', { state: { role: 'student' } })}
                                className="w-full py-5 border-2 border-slate-900 text-slate-900 rounded-2xl font-black flex items-center justify-center space-x-3 hover:bg-slate-900 hover:text-white transition-all shadow-xl shadow-slate-100"
                            >
                                <span>Join Academic Stream</span>
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Landing;
