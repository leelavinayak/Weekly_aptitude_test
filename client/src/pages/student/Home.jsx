import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
    Clock,
    Play,
    CheckCircle,
    ArrowRight,
    Loader2,
    Calendar,
    Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentHome = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const { data } = await api.get('/student/quizzes');
                setQuizzes(data);
            } catch (err) {
                console.error('Failed to fetch quizzes', err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading assessments...</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-20 page-enter">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Challenge Yourself</h1>
                    <p className="text-slate-500 mt-2 text-lg">Pick a topic and test your knowledge.</p>
                </div>
                <div className="hidden md:flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-2xl">
                    <Award size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">{quizzes.length} Available</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
                {quizzes.map((quiz) => (
                    <div key={quiz._id} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden group hover:shadow-2xl hover:shadow-blue-100 transition-all duration-500 flex flex-col animate-fade-in">
                        <div className="bg-blue-600 p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                                <Award size={100} />
                            </div>
                            <span className="bg-white/20 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/20">
                                {quiz.language}
                            </span>
                             <h3 className="text-2xl font-black text-white mt-6 leading-tight mb-4">{quiz.title}</h3>
                             <div className="flex flex-wrap gap-2">
                                {quiz.targetYears?.length > 0 && (
                                    <span className="bg-white/20 text-white px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest backdrop-blur-md border border-white/20">
                                        Year: {quiz.targetYears.join(', ')}
                                    </span>
                                )}
                                {quiz.targetBranches?.length > 0 && (
                                    <span className="bg-white/20 text-white px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest backdrop-blur-md border border-white/20">
                                        Dept: {quiz.targetBranches.join(', ')}
                                    </span>
                                )}
                                {quiz.targetSections?.length > 0 && (
                                    <span className="bg-white/20 text-white px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest backdrop-blur-md border border-white/20">
                                        Sec: {quiz.targetSections.join(', ')}
                                    </span>
                                )}
                             </div>
                        </div>

                        <div className="p-8 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-2xl">
                                        <Clock size={16} className="text-blue-600" />
                                        <span className="text-sm font-bold text-slate-700">{quiz.duration}m</span>
                                    </div>
                                    <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-2xl">
                                        <CheckCircle size={16} className="text-blue-600" />
                                        <span className="text-sm font-bold text-slate-700">{quiz.questions.length} Qs</span>
                                    </div>
                                </div>

                                {quiz.scheduledAt && new Date(quiz.scheduledAt) > new Date() ? (
                                    <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex items-start space-x-3 mb-6">
                                        <Calendar className="text-blue-600 shrink-0" size={20} />
                                        <div>
                                            <p className="text-blue-900 font-black text-xs uppercase tracking-widest">Scheduled</p>
                                            <p className="text-blue-600 text-sm mt-1 font-bold">{new Date(quiz.scheduledAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ) : null}
                            </div>

                            {quiz.isAttempted ? (
                                <button
                                    onClick={() => navigate(`/result/${quiz.attemptId}`)}
                                    className="w-full flex items-center justify-center space-x-2 py-4 bg-slate-50 text-slate-700 font-black rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm group/btn"
                                >
                                    <span>View Review</span>
                                    <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate(`/quiz/${quiz._id}`)}
                                    disabled={quiz.scheduledAt && new Date(quiz.scheduledAt) > new Date()}
                                    className={`w-full flex items-center justify-center space-x-2 py-4 rounded-2xl font-black transition-all shadow-lg ${quiz.scheduledAt && new Date(quiz.scheduledAt) > new Date()
                                            ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                                            : 'btn-blue'
                                        }`}
                                >
                                    <span>Start Quiz</span>
                                    <Play size={18} fill="currentColor" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {quizzes.length === 0 && (
                <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 animate-fade-in">
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3 animate-float">
                        <Clock size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">No Quizzes Active</h2>
                    <p className="text-slate-500 mt-2 font-medium">Your instructors haven't posted any quizzes yet.</p>
                </div>
            )}
        </div>
    );
};

export default StudentHome;
