import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
    User,
    Mail,
    School,
    BookOpen,
    Calendar,
    Briefcase,
    ArrowLeft,
    TrendingUp,
    CheckCircle2,
    Clock,
    ChevronRight,
    Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

const StudentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const { data } = await api.get(`/admin/student/${id}`);
                setData(data);
            } catch (err) {
                toast.error('Failed to load student details');
                navigate('/admin/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchStudentData();
    }, [id, navigate]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
    );

    const { student, history, metrics } = data;

    return (
        <div className="max-w-6xl mx-auto px-6 pt-12 pb-20">
            <button
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center space-x-2 text-slate-400 hover:text-blue-600 font-bold mb-10 transition-colors group"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span>Back to Administration Overview</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 text-center sticky top-28">
                        <div className="relative inline-block mb-6">
                            {student.profilePic ? (
                                <img src={student.profilePic} className="w-32 h-32 rounded-[2rem] object-cover ring-8 ring-blue-50" alt="" />
                            ) : (
                                <div className="w-32 h-32 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center text-5xl font-black shadow-2xl shadow-blue-100">
                                    {student.name.charAt(0)}
                                </div>
                            )}
                            <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white shadow-sm font-black flex items-center justify-center text-white text-[10px]">✓</div>
                        </div>

                        <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-1">{student.name}</h2>
                        <p className="text-blue-600 font-black text-[10px] uppercase tracking-widest bg-blue-50 py-1.5 px-4 rounded-full inline-block mb-8">Registered Student</p>

                        <div className="space-y-4 text-left border-t border-slate-50 pt-8">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                    <Mail size={18} />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                                    <p className="font-bold text-slate-700 truncate">{student.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                    <School size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">College / Institution</p>
                                    <p className="font-bold text-slate-700">{student.collegeName || 'Not Specified'}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                    <Briefcase size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Course / Branch</p>
                                    <p className="font-bold text-slate-700">{student.branch || 'Not Specified'}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                    <BookOpen size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">College ID / Roll No</p>
                                    <p className="font-bold text-slate-700">{student.collegeId || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Year</p>
                                    <p className="font-bold text-slate-700">{student.year || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Analytics & History */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-900 rounded-[2rem] p-8 text-white">
                            <TrendingUp className="text-blue-400 mb-4" size={32} />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Performance Index</p>
                            <p className="text-3xl font-black">{metrics.averageScore}%</p>
                        </div>
                        <div className="bg-blue-600 rounded-[2rem] p-8 text-white shadow-xl shadow-blue-100">
                            <CheckCircle2 className="text-blue-200 mb-4" size={32} />
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Quizzes Passed</p>
                            <p className="text-3xl font-black">{metrics.passRank}</p>
                        </div>
                        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                            <Clock className="text-slate-400 mb-4" size={32} />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Attempts</p>
                            <p className="text-3xl font-black text-slate-800">{metrics.totalAttempts}</p>
                        </div>
                    </div>

                    {/* Recent Attempts Table */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10">
                        <h3 className="text-2xl font-black text-slate-800 mb-10 tracking-tight flex items-center">
                            <BookOpen className="mr-3 text-blue-600" /> Assessment History
                        </h3>

                        <div className="space-y-4">
                            {history.map((attempt) => (
                                <div
                                    key={attempt._id}
                                    onClick={() => navigate(`/admin/review-attempt/${attempt._id}`)}
                                    className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 group cursor-pointer hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${attempt.status === 'pass' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {attempt.status === 'pass' ? 'P' : 'F'}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800 group-hover:text-blue-600 transition-colors uppercase text-[10px] tracking-widest">{attempt.quizId?.title}</p>
                                            <p className="text-xs font-bold text-slate-400 mt-0.5">{new Date(attempt.submittedAt || attempt.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-6">
                                        <div className="text-right">
                                            <p className={`text-xl font-black ${attempt.status === 'pass' ? 'text-green-600' : 'text-red-600'}`}>{attempt.percentage}%</p>
                                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Result</p>
                                        </div>
                                        <ChevronRight size={20} className="text-slate-200 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            ))}

                            {history.length === 0 && (
                                <div className="text-center py-20 text-slate-200 font-black uppercase tracking-widest text-[10px]">
                                    No assessment records found
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDetail;
