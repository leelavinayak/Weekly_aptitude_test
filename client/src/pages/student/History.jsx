import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
    Clock,
    Trophy,
    Calendar,
    ChevronRight,
    Loader2,
    Search,
    Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MyHistory = () => {
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [limit, setLimit] = useState('10');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const endpoint = user.role === 'admin' ? `/admin/history?limit=${limit}` : `/student/results?limit=${limit}`;
                const { data } = await api.get(endpoint);
                setAttempts(data);
            } catch (err) {
                console.error('Failed to fetch history', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [user.role, limit]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading history...</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto px-6 pt-16 pb-20 page-enter">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                <div>
                    <h1 className="text-5xl font-black text-slate-800 tracking-tight">Performance History</h1>
                    <p className="text-slate-500 mt-4 text-lg font-medium">Track your academic journey and quiz results.</p>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-4">
                    {user.role === 'admin' && (
                        <div className="bg-white px-6 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Limit:</span>
                            <select
                                value={limit}
                                onChange={(e) => setLimit(e.target.value)}
                                className="bg-transparent border-none font-black text-blue-600 focus:ring-0 text-xs cursor-pointer"
                            >
                                <option value="10">10 History</option>
                                <option value="30">30 Records</option>
                                <option value="100">100 Entries</option>
                                <option value="all">View All</option>
                            </select>
                        </div>
                    )}
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3">
                        <Trophy className="text-amber-500" size={20} />
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Average Score</p>
                            <p className="text-lg font-black text-slate-800">
                                {attempts.length > 0
                                    ? Math.round(attempts.reduce((acc, curr) => acc + curr.percentage, 0) / attempts.length)
                                    : 0}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6 stagger-children">
                {attempts.map((attempt) => (
                    <div
                        key={attempt._id}
                        onClick={() => {
                            if (user.role === 'admin') {
                                navigate(`/admin/review-attempt/${attempt._id}`);
                            } else {
                                navigate(`/result/${attempt._id}`);
                            }
                        }}
                        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-50 transition-all duration-500 group cursor-pointer relative overflow-hidden animate-fade-in"
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-[0.03] transition-transform duration-700 group-hover:scale-150 ${attempt.status === 'pass' ? 'bg-green-600' : 'bg-red-600'}`}></div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                            <div className="flex items-center space-x-6">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:-rotate-6 ${attempt.status === 'pass' ? 'bg-green-600 shadow-green-100' : 'bg-red-600 shadow-red-100'}`}>
                                    <Trophy className="text-white" size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors uppercase text-sm mb-1">{attempt.quizId?.title}</h3>

                                    {user.role === 'admin' && attempt.studentId && (
                                        <div className="flex items-center space-x-2 mb-2 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 w-fit">
                                            <div className="w-5 h-5 rounded-full bg-blue-600 text-[10px] flex items-center justify-center text-white font-black">
                                                {attempt.studentId.name.charAt(0)}
                                            </div>
                                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{attempt.studentId.name}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center space-x-4 text-slate-400 text-xs font-bold">
                                        <span className="flex items-center uppercase tracking-widest"><Calendar size={12} className="mr-1.5" /> {new Date(attempt.submittedAt).toLocaleDateString()}</span>
                                        <span className="flex items-center uppercase tracking-widest"><Clock size={12} className="mr-1.5" /> {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-12">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Score Result</p>
                                    <div className="flex items-end justify-end space-x-1">
                                        <span className={`text-4xl font-black tracking-tighter ${attempt.status === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
                                            {attempt.percentage}%
                                        </span>
                                        <span className="text-slate-300 font-black text-lg mb-1.5">/ 100</span>
                                    </div>
                                </div>
                                <ChevronRight className="w-6 h-6 text-slate-200 group-hover:text-blue-600 group-hover:translate-x-2 transition-all" />
                            </div>
                        </div>
                    </div>
                ))}

                {attempts.length === 0 && (
                    <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100 border-dashed animate-fade-in">
                        <Clock size={48} className="mx-auto text-slate-200 mb-6" />
                        <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">No quiz history yet</h3>
                        <p className="text-slate-300 mt-2 font-medium">Complete your first assessment to see results here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyHistory;
