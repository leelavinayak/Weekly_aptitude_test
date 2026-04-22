import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
    Users,
    BookOpen,
    Trophy,
    TrendingUp,
    Clock,
    BarChart3,
    ChevronRight,
    Loader2,
    Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
    const navigate = useNavigate();

    const formatTime = (seconds) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quizSearchTerm, setQuizSearchTerm] = useState('');
    const [tableSearchTerm, setTableSearchTerm] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/admin/dashboard');
                setData(data);
            } catch (err) {
                console.error('Failed to fetch stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading dashboard...</p>
            </div>
        </div>
    );

    const stats = [
        { label: 'Total Students', value: data?.stats?.totalStudents || 0, icon: Users, color: 'bg-blue-600', shadow: 'shadow-blue-100' },
        { label: 'Quizzes Created', value: data?.stats?.totalQuizzes || 0, icon: BookOpen, color: 'bg-slate-900', shadow: 'shadow-slate-200' },
        { label: 'Total Attempts', value: data?.stats?.totalAttempts || 0, icon: Clock, color: 'bg-blue-600', shadow: 'shadow-blue-100' },
        { label: 'Avg Achievement', value: `${data?.quizStats?.[0]?.avgScore ? Math.round(data.quizStats[0].avgScore) : 0}%`, icon: Trophy, color: 'bg-slate-900', shadow: 'shadow-slate-200' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-12 page-enter">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Admin Overview</h1>
                    <p className="text-slate-500 mt-2 text-lg">Real-time performance metrics and student activity.</p>
                </div>

                <div className="relative w-full md:w-96 group">
                    <div className="flex items-center space-x-2">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search assessment..."
                                className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-[11px] font-black text-slate-700 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all placeholder:text-slate-300 uppercase tracking-widest"
                                value={quizSearchTerm}
                                onChange={(e) => setQuizSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            className="bg-blue-600 text-white p-3.5 rounded-2xl shadow-lg shadow-blue-100 hover:bg-slate-900 transition-all group/btn"
                        >
                            <Search size={18} className="group-hover/btn:scale-110 transition-transform" />
                        </button>
                    </div>

                    {/* Search Results Dropdown */}
                    {quizSearchTerm.length > 0 && (
                        <div className="absolute top-full mt-3 left-0 right-0 bg-white rounded-[2rem] border border-slate-100 shadow-2xl p-4 z-50 animate-fade-in max-h-60 overflow-y-auto scrollbar-thin">
                            {data?.quizStats
                                ?.filter(q => q.title.toLowerCase().includes(quizSearchTerm.toLowerCase()))
                                .map((quiz, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => navigate(`/admin/quiz/${quiz.id}/leaderboard`)}
                                        className="w-full text-left p-4 rounded-xl hover:bg-blue-50 transition-colors group/item flex items-center justify-between"
                                    >
                                        <div>
                                            <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest group-hover/item:text-blue-600 transition-colors">{quiz.title}</p>
                                            <p className="text-[8px] font-bold text-slate-400 mt-0.5 uppercase">Performance Summary</p>
                                        </div>
                                        <ChevronRight size={14} className="text-slate-200 group-hover/item:text-blue-600 transition-colors" />
                                    </button>
                                ))
                            }
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 stagger-children">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-50 transition-all duration-300 group animate-fade-in">
                        <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-lg ${stat.shadow} group-hover:scale-110 transition-transform`}>
                            <stat.icon className="text-white" size={24} />
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Bar Chart */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-50 transition-all duration-500">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-2xl font-black text-slate-800 flex items-center">
                            <BarChart3 className="mr-3 text-blue-600" /> Quiz Performance
                        </h2>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.quizStats || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="title" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} unit="%" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px 16px', fontWeight: 700 }}
                                />
                                <Bar
                                    dataKey="avgScore"
                                    fill="#2563eb"
                                    radius={[8, 8, 0, 0]}
                                    barSize={45}
                                    className="cursor-pointer"
                                    onClick={(e) => {
                                        if (e && e.activePayload) {
                                            const quizId = e.activePayload[0].payload.id;
                                            navigate(`/admin/quiz/${quizId}/leaderboard`);
                                        }
                                    }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-50 transition-all duration-500">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
                        <h2 className="text-2xl font-black text-slate-800 flex items-center shrink-0">
                            <TrendingUp className="mr-3 text-blue-600" /> Top Performers
                        </h2>

                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search by Quiz Title (e.g. Code Smash)..."
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all shadow-inner"
                                value={tableSearchTerm}
                                onChange={(e) => setTableSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto h-[600px] pr-2 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
                        <table className="w-full text-left border-separate border-spacing-y-3">
                            <thead className="sticky top-0 bg-white z-10">
                                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                    <th className="px-6 pb-4">Rank</th>
                                    <th className="px-6 pb-4">Student</th>
                                    <th className="px-6 pb-4">Assessment</th>
                                    <th className="px-6 pb-4">Score</th>
                                    <th className="px-6 pb-4 text-right">Review</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.recentAttempts
                                    ?.filter(attempt =>
                                        !tableSearchTerm ||
                                        attempt.quizId?.title?.toLowerCase().includes(tableSearchTerm.toLowerCase())
                                    )
                                    .map((attempt, idx) => (
                                        <tr
                                            key={idx}
                                            className="group hover:bg-blue-50/50 transition-all duration-300"
                                        >
                                            <td className="px-6 py-5 bg-slate-50/50 group-hover:bg-blue-50/50 rounded-l-[1.5rem] border-y border-l border-transparent group-hover:border-blue-100 transition-colors">
                                                <span className="text-lg font-black text-slate-400 group-hover:text-blue-600 transition-colors">#{idx + 1}</span>
                                            </td>
                                            <td className="px-6 py-5 bg-slate-50/50 group-hover:bg-blue-50/50 border-y border-transparent group-hover:border-blue-100 transition-colors">
                                                <div
                                                    className="flex items-center space-x-4 cursor-pointer group/user"
                                                    onClick={() => navigate(`/admin/student/${attempt.studentId?._id}`)}
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-slate-900 group-hover/user:bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-slate-100 transition-colors shrink-0">
                                                        {attempt.studentId?.name.charAt(0)}
                                                    </div>
                                                    <div className="max-w-[150px]">
                                                        <p className="font-black text-slate-800 group-hover/user:text-blue-600 transition-colors uppercase text-[10px] tracking-widest truncate">{attempt.studentId?.name}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 mt-0.5 truncate">{attempt.studentId?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 bg-slate-50/50 group-hover:bg-blue-50/50 border-y border-transparent group-hover:border-blue-100 transition-colors">
                                                <div>
                                                    <p className="font-bold text-slate-700 text-xs truncate max-w-[200px]">{attempt.quizId?.title}</p>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <Clock size={10} className="text-slate-300" />
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{formatTime(attempt.timeTaken)} taken</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 bg-slate-50/50 group-hover:bg-blue-50/50 border-y border-transparent group-hover:border-blue-100 transition-colors">
                                                <div className="flex flex-col">
                                                    <span className={`text-xl font-black ${attempt.status === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
                                                        {attempt.percentage}%
                                                    </span>
                                                    <span className="text-[9px] font-black text-slate-400 -mt-1 uppercase tracking-tighter">
                                                        {attempt.score}/{attempt.totalMarks} Pts
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 bg-slate-50/50 group-hover:bg-blue-50/50 rounded-r-[1.5rem] border-y border-r border-transparent group-hover:border-blue-100 text-right transition-colors">
                                                <button
                                                    onClick={() => navigate(`/admin/review-attempt/${attempt._id}`)}
                                                    className="p-3 bg-white text-slate-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-slate-100 hover:border-blue-600 group/btn"
                                                >
                                                    <ChevronRight size={20} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>

                        {(!data?.recentAttempts || data.recentAttempts.length === 0) && (
                            <div className="text-center py-20">
                                <Loader2 className="w-10 h-10 mx-auto text-slate-200 mb-4 animate-spin" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No recent activity found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
