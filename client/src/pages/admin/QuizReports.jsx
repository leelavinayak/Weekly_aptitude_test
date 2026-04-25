import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
    FileText,
    Download,
    Filter,
    ChevronRight,
    ChevronLeft,
    Loader2,
    Trophy,
    User,
    Calendar,
    Search,
    School,
    GraduationCap,
    Clock,
    BookOpen,
    Trash2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

const QuizReports = () => {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [leaderboard, setLeaderboard] = useState([]);
    const [filters, setFilters] = useState({
        year: '',
        branch: '',
        section: ''
    });
    const [fetchingLeaderboard, setFetchingLeaderboard] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [studentSearchTerm, setStudentSearchTerm] = useState('');

    const formatTime = (seconds) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const { data } = await api.get('/admin/quizzes');
            setQuizzes(data);
        } catch (err) {
            toast.error('Failed to load quizzes');
        } finally {
            setLoading(false);
        }
    };

    const handleQuizSelect = (quiz) => {
        setSelectedQuiz(quiz);
        setFilters({ year: '', branch: '', section: '' });
        setStudentSearchTerm('');
        fetchLeaderboard(quiz.id, { year: '', branch: '', section: '' });
    };

    const fetchLeaderboard = async (quizId, currentFilters) => {
        setFetchingLeaderboard(true);
        try {
            const queryParams = new URLSearchParams(currentFilters).toString();
            const { data } = await api.get(`/admin/quiz/${quizId}/leaderboard?${queryParams}`);
            setLeaderboard(data.leaderboard || []);
        } catch (err) {
            toast.error('Failed to load report data');
        } finally {
            setFetchingLeaderboard(false);
        }
    };

    const handleFilterChange = (e) => {
        const newFilters = { ...filters, [e.target.name]: e.target.value };
        setFilters(newFilters);
        fetchLeaderboard(selectedQuiz.id, newFilters);
    };

    const downloadExcel = () => {
        try {
            if (!leaderboard || !leaderboard.length) {
                return toast.error('No data to export');
            }

            const exportData = leaderboard.map((attempt, index) => ({
                'Rank': index + 1,
                'Student Name': attempt.studentId?.name || 'N/A',
                'Email': attempt.studentId?.email || 'N/A',
                'College ID': attempt.studentId?.collegeId || 'N/A',
                'Year': attempt.studentId?.year || 'N/A',
                'Branch': attempt.studentId?.branch || 'N/A',
                'Section': attempt.studentId?.section || 'N/A',
                'Score (%)': attempt.percentage || 0,
                'Time Taken (s)': attempt.timeTaken || 0,
                'Status': attempt.status || 'N/A',
                'Attempted At': attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : 'N/A'
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Quiz Report");

            // Sanitize filename
            const cleanTitle = (selectedQuiz?.title || 'Report').replace(/[/\\?%*:|"<>]/g, '-');
            const fileName = `${cleanTitle}_Report_${filters.year || 'All'}_${filters.branch || 'All'}.xlsx`;

            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([wbout], { type: 'application/octet-stream' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('Report generated successfully');
        } catch (err) {
            console.error('Excel Export Error:', err);
            toast.error('Failed to generate Excel file');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-20 page-enter">
            {!selectedQuiz ? (
                <div className="space-y-10">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                        <div>
                            <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">Assessment Reports</h1>
                            <p className="text-slate-400 mt-2 font-medium text-xs md:text-base">Select an assessment to view detailed demographic performance.</p>
                        </div>
                        <div className="relative w-full md:w-80 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search assessment..."
                                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold text-slate-700"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {quizzes.filter(q => q.title.toLowerCase().includes(searchTerm.toLowerCase())).map((quiz) => (
                            <div
                                key={quiz.id}
                                onClick={() => handleQuizSelect(quiz)}
                                className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all cursor-pointer group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-blue-50 rounded-full -mr-12 -mt-12 md:-mr-16 md:-mt-16 opacity-50 group-hover:scale-150 transition-transform duration-700"></div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4 md:mb-6">
                                        <div className="bg-blue-600 p-2.5 md:p-3 rounded-xl md:rounded-2xl shadow-lg shadow-blue-100 text-white">
                                            <FileText size={20} className="md:size-6" />
                                        </div>
                                        <ChevronRight className="text-slate-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" size={20} />
                                    </div>
                                    <h3 className="text-lg md:text-xl font-black text-slate-800 mb-4 leading-tight group-hover:text-blue-600 transition-colors">{quiz.title}</h3>
                                    
                                    <div className="space-y-3 mb-6">
                                        <div className="flex flex-wrap gap-2">
                                            <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-blue-100/50 flex items-center">
                                                <GraduationCap size={12} className="mr-1.5" />
                                                {quiz.targetYears?.length > 0 ? quiz.targetYears.join(', ') : 'All Years'}
                                            </span>
                                            <span className="bg-slate-50 text-slate-500 px-2.5 py-1 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-slate-100 flex items-center">
                                                <School size={12} className="mr-1.5" />
                                                {quiz.targetBranches?.length > 0 ? quiz.targetBranches.join(', ') : 'All Branches'}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-amber-100/50">
                                                SEC: {quiz.targetSections?.length > 0 ? quiz.targetSections.join(', ') : 'All'}
                                            </span>
                                            <span className="text-[9px] font-black text-slate-200 uppercase tracking-widest">•</span>
                                            <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                                                <Calendar size={12} className="mr-1.5" />
                                                {new Date(quiz.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="pt-4 md:pt-6 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <User size={14} className="text-blue-600" />
                                            <span className="text-[10px] font-black text-slate-700">View Analytics</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-10">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                        <div>
                            <button
                                onClick={() => setSelectedQuiz(null)}
                                className="flex items-center space-x-2 text-slate-400 hover:text-blue-600 font-bold mb-4 transition-colors group"
                            >
                                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Back to Assessments</span>
                            </button>
                            <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight leading-tight">{selectedQuiz.title}</h1>
                            <p className="text-slate-400 mt-2 font-medium flex items-center text-xs md:text-base">
                                <BookOpen className="mr-2" size={14} /> Demographic Performance Audit
                            </p>
                        </div>
                        <button
                            onClick={downloadExcel}
                            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center space-x-3 hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
                        >
                            <Download size={20} />
                            <span>Export to Excel</span>
                        </button>
                    </div>

                    {/* Filters & Search */}
                    <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center">
                                    <Calendar className="mr-2 text-blue-600" size={14} /> Target Year
                                </label>
                                <select
                                    name="year"
                                    value={filters.year}
                                    onChange={handleFilterChange}
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                                >
                                    <option value="">All Years</option>
                                    <option value="1st Year">1st Year</option>
                                    <option value="2nd Year">2nd Year</option>
                                    <option value="3rd Year">3rd Year</option>
                                    <option value="4th Year">4th Year</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center">
                                    <GraduationCap className="mr-2 text-blue-600" size={14} /> Branch / Stream
                                </label>
                                <input
                                    type="text"
                                    name="branch"
                                    placeholder="e.g. Computer Science"
                                    value={filters.branch}
                                    onChange={handleFilterChange}
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center">
                                    <Filter className="mr-2 text-blue-600" size={14} /> Section
                                </label>
                                <select
                                    name="section"
                                    value={filters.section}
                                    onChange={handleFilterChange}
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                                >
                                    <option value="">All Sections</option>
                                    <option value="A">Section A</option>
                                    <option value="B">Section B</option>
                                    <option value="C">Section C</option>
                                    <option value="D">Section D</option>
                                </select>
                            </div>
                        </div>

                        {/* Student Search Bar */}
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search by student name or college ID..."
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold text-slate-700"
                                value={studentSearchTerm}
                                onChange={(e) => setStudentSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Table / Card List */}
                    <div className="bg-white md:rounded-[3rem] rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px] relative">
                        {fetchingLeaderboard && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
                                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                            </div>
                        )}

                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                        <th className="px-10 py-6">Rank</th>
                                        <th className="px-6 py-6">Student Info</th>
                                        <th className="px-6 py-6">Branch/Year</th>
                                        <th className="px-6 py-6 text-center">Score</th>
                                        <th className="px-10 py-6 text-right">Performance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {leaderboard
                                        .filter(a =>
                                            !studentSearchTerm ||
                                            (a.studentId?.name || '').toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                                            (a.studentId?.collegeId || '').toLowerCase().includes(studentSearchTerm.toLowerCase())
                                        )
                                        .map((attempt, idx) => (
                                        <tr key={attempt.id} className="hover:bg-blue-50/30 transition-all group">
                                            <td className="px-10 py-6">
                                                <span className={`text-lg font-black ${idx < 3 ? 'text-blue-600' : 'text-slate-300'}`}>
                                                    #{idx + 1}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div 
                                                    className="flex items-center space-x-4 cursor-pointer"
                                                    onClick={() => navigate(`/admin/review-attempt/${attempt._id || attempt.id}`)}
                                                >
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-lg group-hover:bg-blue-600 transition-colors">
                                                        {attempt.studentId?.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-800 uppercase text-[11px] tracking-widest group-hover:text-blue-600 transition-colors">{attempt.studentId?.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400">{attempt.studentId?.collegeId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="space-y-1">
                                                    <div className="flex items-center space-x-2">
                                                        <School size={12} className="text-blue-600" />
                                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{attempt.studentId?.branch}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <GraduationCap size={12} className="text-slate-400" />
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{attempt.studentId?.year} - SEC {attempt.studentId?.section || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <span className={`text-xl font-black ${attempt.status === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {attempt.percentage}%
                                                </span>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <div className="flex flex-col items-end">
                                                    <div className="flex items-center space-x-1 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                                                        <Clock size={10} />
                                                        <span>{formatTime(attempt.timeTaken)} taken</span>
                                                    </div>
                                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] mt-1 ${attempt.status === 'pass' ? 'text-green-500' : 'text-red-400'}`}>
                                                        {attempt.status}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-slate-50">
                            {leaderboard
                                .filter(a =>
                                    (a.studentId?.name || '').toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                                    (a.studentId?.collegeId || '').toLowerCase().includes(studentSearchTerm.toLowerCase())
                                )
                                .map((attempt, idx) => (
                                    <div key={attempt.id} className="p-6 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div 
                                                className="flex items-center space-x-4 cursor-pointer"
                                                onClick={() => navigate(`/admin/review-attempt/${attempt._id || attempt.id}`)}
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm group-hover:bg-blue-600 transition-colors">
                                                    #{idx + 1}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 uppercase text-[10px] tracking-widest group-hover:text-blue-600 transition-colors">{attempt.studentId?.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400">{attempt.studentId?.collegeId}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-xl font-black ${attempt.status === 'pass' ? 'text-green-600' : 'text-red-600'}`}>{attempt.percentage}%</p>
                                                <p className={`text-[8px] font-black uppercase tracking-widest ${attempt.status === 'pass' ? 'text-green-500' : 'text-red-400'}`}>{attempt.status}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Department</p>
                                                <p className="text-[10px] font-bold text-slate-600">{attempt.studentId?.branch}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Year / Sec</p>
                                                <p className="text-[10px] font-bold text-slate-600">{attempt.studentId?.year} - {attempt.studentId?.section || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>

                        {leaderboard.length === 0 && !fetchingLeaderboard && (
                            <div className="text-center py-20 md:py-32 bg-slate-50/50">
                                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                    <Trophy className="text-slate-200" size={32} />
                                </div>
                                <p className="text-slate-400 font-black uppercase tracking-widest text-xs px-6">No data available for these filters</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizReports;
