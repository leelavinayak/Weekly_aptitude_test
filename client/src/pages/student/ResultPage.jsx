import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
    Trophy,
    XCircle,
    CheckCircle2,
    Clock,
    ArrowLeft,
    Loader2,
    RefreshCcw,
    Zap
} from 'lucide-react';

const ResultPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const { data } = await api.get(`/student/results/${id}`);
                setResult(data);
            } catch (err) {
                console.error('Result load error:', err);
                navigate('/student/home');
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [id, navigate]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading results...</p>
            </div>
        </div>
    );

    const isPass = result.status === 'pass';
    const questions = result.quizId?.questions || [];
    const correctCount = questions.filter((q, i) => {
        const qId = q._id || q.id || i.toString();
        const studentAnswer = result.answers?.find(a => a.questionId.toString() === qId.toString())?.selectedAnswer;
        return studentAnswer === q.correctAnswer;
    }).length;

    return (
        <div className="max-w-5xl mx-auto px-6 pt-12 pb-20 page-enter">
            {/* Score Summary Card */}
            <div className="bg-white rounded-[3rem] shadow-sm overflow-hidden mb-16 border border-slate-100 animate-scale-up">
                <div className={`p-12 text-center text-white relative overflow-hidden ${isPass ? 'bg-blue-600' : 'bg-slate-800'}`}>
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full border-[20px] border-white/30"></div>
                        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full border-[15px] border-white/20"></div>
                    </div>
                    <div className="relative z-10">
                        <div className="w-28 h-28 bg-white/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 backdrop-blur-md border border-white/30 rotate-3 animate-float">
                            {isPass ? <Trophy size={56} /> : <Zap size={56} />}
                        </div>
                        <h1 className="text-5xl font-black mb-3 tracking-tighter uppercase">{isPass ? 'Certified!' : 'Review Session'}</h1>
                        <p className="text-white/80 font-bold text-lg">{isPass ? "You have successfully cleared this assessment." : "Analyze your performance and bridge the gaps."}</p>
                    </div>
                </div>

                <div className="p-12 grid grid-cols-1 md:grid-cols-4 gap-10 text-center bg-white">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Final Score</p>
                        <p className={`text-5xl font-black ${isPass ? 'text-blue-600' : 'text-slate-800'}`}>{result.score}<span className="text-2xl text-slate-300 font-bold"> / {result.totalMarks}</span></p>
                    </div>
                    <div className="md:border-x border-slate-100 px-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Accuracy</p>
                        <p className="text-5xl font-black text-slate-800">{result.percentage}%</p>
                    </div>
                    <div className="md:border-r border-slate-100 px-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Correct</p>
                        <p className="text-5xl font-black text-blue-600">{correctCount}<span className="text-2xl text-slate-300 font-bold"> / {result.quizId.questions.length}</span></p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Time Invested</p>
                        <div className="flex items-center justify-center text-slate-800">
                            <Clock size={28} className="mr-3 text-blue-600" />
                            <p className="text-5xl font-black">{Math.floor(result.timeTaken / 60)}<span className="text-2xl text-slate-300 font-bold">m</span></p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-black text-slate-800 flex items-center tracking-tight">
                    <Zap className="mr-3 text-blue-600" /> Performance Analysis
                </h2>
                <button
                    onClick={() => navigate('/student/home')}
                    className="flex items-center space-x-2 text-blue-600 font-black text-xs uppercase tracking-widest transition-all hover:translate-x-[-4px] group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Dashboard</span>
                </button>
            </div>

            {/* Question Review List */}
            <div className="space-y-8 stagger-children">
                {questions.map((q, i) => {
                    const qId = q._id || q.id || i.toString();
                    const studentAnswer = result.answers?.find(a => a.questionId.toString() === qId.toString())?.selectedAnswer;
                    const isCorrect = studentAnswer === q.correctAnswer;

                    return (
                        <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 relative group hover:shadow-xl hover:shadow-blue-50 transition-all duration-500 animate-fade-in">
                            <div className="flex justify-between items-start mb-8">
                                <span className="bg-slate-50 text-slate-400 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">Item {i + 1}</span>
                                {isCorrect ? (
                                    <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center">
                                        <CheckCircle2 size={16} className="mr-2" /> Correct Response
                                    </span>
                                ) : (
                                    <span className="bg-red-50 text-red-600 px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center">
                                        <XCircle size={16} className="mr-2" /> Incorrect Response
                                    </span>
                                )}
                            </div>

                            <h3 className="text-2xl font-black text-slate-800 mb-8 leading-tight tracking-tight">{q.question}</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {q.options.map((opt, idx) => {
                                    const isSelected = opt === studentAnswer;
                                    const isTruth = opt === q.correctAnswer;

                                    let borderColor = 'border-slate-50';
                                    let bgColor = 'bg-slate-50/50';
                                    let textColor = 'text-slate-500';

                                    if (isTruth) {
                                        borderColor = 'border-blue-600';
                                        bgColor = 'bg-blue-50/30';
                                        textColor = 'text-blue-900';
                                    } else if (isSelected && !isCorrect) {
                                        borderColor = 'border-red-600';
                                        bgColor = 'bg-red-50/30';
                                        textColor = 'text-red-900';
                                    }

                                    return (
                                        <div
                                            key={idx}
                                            className={`p-5 rounded-2xl border-2 flex items-center transition-all ${borderColor} ${bgColor} ${textColor} ${isTruth || (isSelected && !isCorrect) ? 'font-black scale-[1.02]' : 'font-bold'}`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 shrink-0 font-black ${isTruth ? 'bg-blue-600 text-white' : isSelected ? 'bg-red-600 text-white' : 'bg-white text-slate-300'}`}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <span className="text-sm">{opt}</span>
                                            {isTruth && <CheckCircle2 size={24} className="ml-auto text-blue-600" />}
                                            {isSelected && !isCorrect && <XCircle size={24} className="ml-auto text-red-600" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-16 flex justify-center">
                <button
                    onClick={() => navigate('/student/home')}
                    className="btn-blue py-5 px-16 text-xl flex items-center justify-center space-x-3"
                >
                    <RefreshCcw size={24} />
                    <span>Explore More Quizzes</span>
                </button>
            </div>
        </div>
    );
};

export default ResultPage;
