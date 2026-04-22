import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
    Trophy, 
    ChevronLeft,
    Clock,
    User,
    ChevronRight,
    Loader2,
    BookOpen,
    Medal,
    School,
    GraduationCap,
    Search
} from 'lucide-react';
import toast from 'react-hot-toast';

const QuizLeaderboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const { data } = await api.get(`/admin/quiz/${id}/leaderboard`);
                setData(data);
            } catch (err) {
                toast.error('Failed to load participation details');
                navigate('/admin/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [id, navigate]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
    );

    if (!data) return (
        <div className="text-center py-20 text-slate-400 font-black uppercase tracking-widest text-xs">
            No data found for this quiz
        </div>
    );

    const formatTime = (seconds) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const { quiz, leaderboard = [] } = data;

    // Filter leaderboard based on search term
    const filteredLeaderboard = leaderboard.filter(attempt => 
        attempt.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attempt.studentId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attempt.studentId?.collegeName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-20">
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-slate-400 hover:text-blue-600 font-bold mb-10 transition-colors group"
            >
                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span>Back to Analytics</span>
            </button>

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-12 mb-10 animate-fade-in overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-8">
                    <div className="flex-1">
                        <div className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-4 shadow-lg shadow-blue-100">
                            Participation Audit
                        </div>
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-4">{quiz?.title}</h1>
                        <div className="flex flex-wrap gap-6 items-center justify-center md:justify-start">
                            <div className="flex items-center space-x-2 bg-slate-50 px-4 py-2 rounded-xl">
                                <BookOpen className="text-blue-600" size={18} />
                                <span className="font-black text-slate-700 uppercase text-[10px] tracking-widest">{quiz?.language}</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-slate-50 px-4 py-2 rounded-xl">
                                <User className="text-blue-600" size={18} />
                                <span className="font-black text-slate-700 uppercase text-[10px] tracking-widest">{leaderboard.length} Participants</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white min-w-[280px] text-center shadow-2xl shadow-blue-900/20 transform hover:scale-105 transition-transform duration-500">
                        <Medal className="text-yellow-400 mx-auto mb-4" size={48} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Top Achiever</p>
                        <p className="text-xl font-black truncate text-white">{leaderboard[0]?.studentId?.name || 'N/A'}</p>
                        <div className="mt-4 flex items-center justify-center space-x-2">
                             <span className="text-blue-400 font-black text-4xl">{leaderboard[0]?.percentage || 0}%</span>
                             <span className="text-[10px] font-black text-slate-500 uppercase">Score</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight flex items-center">
                            <GraduationCap className="mr-3 text-blue-600" size={28} /> Participation Details
                        </h3>
                        <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">Complete list of students who attempted this assessment</p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by student, email or college..."
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                <th className="px-10 py-6">Rank</th>
                                <th className="px-6 py-6">Student Info</th>
                                <th className="px-6 py-6">Institution</th>
                                <th className="px-6 py-6">Branch</th>
                                <th className="px-6 py-6">Performance</th>
                                <th className="px-10 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredLeaderboard.map((attempt, idx) => {
                                const actualRank = leaderboard.findIndex(a => a._id === attempt._id) + 1;
                                return (
                                    <tr key={attempt._id} className="hover:bg-blue-50/30 transition-all group">
                                        <td className="px-10 py-6">
                                            <span className={`text-lg font-black ${actualRank <= 3 ? 'text-blue-600' : 'text-slate-300'} group-hover:scale-110 inline-block transition-transform`}>
                                                #{actualRank}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div 
                                                className="flex items-center space-x-4 cursor-pointer"
                                                onClick={() => navigate(`/admin/student/${attempt.studentId?._id}`)}
                                            >
                                                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-lg group-hover:bg-blue-600 transition-colors">
                                                    {attempt.studentId?.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 uppercase text-[11px] tracking-widest group-hover:text-blue-600 transition-colors">{attempt.studentId?.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">{attempt.studentId?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center space-x-2">
                                                <School size={14} className="text-slate-300" />
                                                <span className="font-bold text-slate-600 text-xs truncate max-w-[150px]">{attempt.studentId?.collegeName || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100">
                                                {attempt.studentId?.branch || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col">
                                                <span className={`text-xl font-black ${attempt.status === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {attempt.percentage}%
                                                </span>
                                                <div className="flex items-center space-x-1 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                                                    <Clock size={10} />
                                                    <span>{formatTime(attempt.timeTaken)} taken</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <button 
                                                onClick={() => navigate(`/admin/review-attempt/${attempt._id}`)}
                                                className="p-3 hover:bg-blue-600 hover:text-white rounded-2xl text-slate-300 transition-all shadow-sm bg-white border border-slate-100 hover:border-blue-600 group-hover:shadow-xl group-hover:shadow-blue-100"
                                                title="Detailed Review"
                                            >
                                                <ChevronRight size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filteredLeaderboard.length === 0 && (
                        <div className="text-center py-32 bg-slate-50/50">
                            <Search className="w-12 h-12 mx-auto text-slate-200 mb-6" />
                            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No students matching "{searchTerm}"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizLeaderboard;
