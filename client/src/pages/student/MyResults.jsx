import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
    History, 
    ChevronRight, 
    Calendar, 
    Clock, 
    Loader2, 
    Filter,
    ArrowUpRight,
    Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyResults = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [limit, setLimit] = useState('10');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const { data } = await api.get(`/student/results?limit=${limit}`);
                setResults(data);
            } catch (err) {
                console.error('Failed to fetch results', err);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [limit]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading results...</p>
            </div>
        </div>
    );

    // Calculate stats
    const totalAttempts = results.length;
    const avgScore = totalAttempts > 0 ? Math.round(results.reduce((a, r) => a + r.percentage, 0) / totalAttempts) : 0;
    const passCount = results.filter(r => r.status === 'pass').length;

    return (
        <div className="max-w-6xl mx-auto px-6 pt-12 pb-20 page-enter">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Exam History</h1>
                    <p className="text-slate-500 mt-2 text-lg">Detailed log of your academic certifications and scores.</p>
                </div>
                
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="bg-white px-6 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Show:</span>
                        <select
                            value={limit}
                            onChange={(e) => setLimit(e.target.value)}
                            className="bg-transparent border-none font-black text-blue-600 focus:ring-0 text-xs cursor-pointer"
                        >
                            <option value="10">Latest 10</option>
                            <option value="50">Latest 50</option>
                            <option value="100">Latest 100</option>
                            <option value="all">View All</option>
                        </select>
                    </div>
                    <div className="flex items-center space-x-3 bg-blue-50 px-4 py-2.5 rounded-2xl border border-blue-100 h-full">
                        <Award size={18} className="text-blue-600" />
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">{passCount} Passed</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 stagger-children">
                {results.map((res) => (
                    <div 
                        key={res._id} 
                        onClick={() => navigate(`/result/${res._id}`)}
                        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-50 transition-all duration-500 group cursor-pointer flex flex-col md:flex-row items-center gap-8 animate-fade-in"
                    >
                        <div className={`w-24 h-24 rounded-[1.5rem] flex flex-col items-center justify-center shrink-0 shadow-lg ${res.status === 'pass' ? 'bg-blue-600 text-white shadow-blue-100' : 'bg-slate-800 text-white shadow-slate-100'}`}>
                            <span className="text-3xl font-black">{res.percentage}%</span>
                            <span className="text-[10px] uppercase font-black opacity-60 tracking-tighter">{res.status}</span>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-2xl font-black text-slate-800 group-hover:text-blue-600 transition-colors leading-tight tracking-tight">{res.quizId?.title}</h3>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-4">
                                <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <Calendar size={14} className="mr-2 text-blue-600" />
                                    <span>{new Date(res.submittedAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <Clock size={14} className="mr-2 text-blue-600" />
                                    <span>{Math.floor(res.timeTaken / 60)}m {res.timeTaken % 60}s</span>
                                </div>
                                <span className="text-[10px] font-black px-3 py-1 rounded-lg bg-blue-50 text-blue-600 uppercase tracking-widest">{res.quizId?.language}</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-10 px-6 md:border-l border-slate-100">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Final Mark</p>
                                <p className="text-2xl font-black text-slate-800">{res.score}<span className="text-sm text-slate-300">/{res.totalMarks}</span></p>
                            </div>
                            <div className="w-14 h-14 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-12 group-hover:shadow-lg group-hover:shadow-blue-100">
                                <ArrowUpRight size={28} />
                            </div>
                        </div>
                    </div>
                ))}

                {results.length === 0 && (
                    <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 animate-fade-in">
                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3 animate-float">
                            <History size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">No Assessment History</h2>
                        <p className="text-slate-500 mt-2 font-bold mb-10">You haven't completed any certifications yet.</p>
                        <button 
                            onClick={() => navigate('/student/home')}
                            className="btn-blue px-10 py-4 text-lg"
                        >
                            Start Learning Now
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyResults;
