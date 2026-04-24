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
    Zap,
    UserCircle
} from 'lucide-react';

const AttemptReview = () => {
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
                console.error('Failed to load result', err);
                navigate('/admin/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [id, navigate]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
    );

    const {
        studentId = { name: 'Student' },
        quizId = { title: 'Unknown Quiz', questions: [] },
        status = 'fail',
        score = 0,
        totalMarks = 0,
        timeTaken = 0,
        answers = []
    } = result || {};

    const isPass = status === 'pass';

    return (
        <div className="max-w-5xl mx-auto px-6 pt-12 pb-20 page-enter">
            <button
                onClick={() => navigate('/admin/users')}
                className="flex items-center space-x-2 text-slate-400 hover:text-blue-600 font-bold mb-6 md:mb-8 transition-colors group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Back to Directory</span>
            </button>

            {/* Header Information */}
            <div className="bg-slate-900 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 mb-8 md:mb-12 text-white shadow-2xl shadow-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="flex items-center space-x-4 md:space-x-6 mb-6 md:mb-0">
                        <div className="w-14 h-14 md:w-20 md:h-20 bg-white/10 rounded-2xl md:rounded-3xl flex items-center justify-center backdrop-blur-md shrink-0">
                            <UserCircle size={32} className="text-blue-400 md:size-12" />
                        </div>
                        <div className="overflow-hidden flex flex-col items-start">
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight truncate">{studentId?.name || 'Student'}</h1>
                            <p className="text-slate-400 font-bold text-xs md:text-base truncate mb-3">Assessment: <span className="text-white">{quizId?.title || 'Unknown Quiz'}</span></p>
                            {studentId?._id && (
                                <button 
                                    onClick={() => navigate(`/admin/student/${studentId._id}`)}
                                    className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors flex items-center"
                                >
                                    <Trophy size={12} className="mr-2" /> View Performance History
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="bg-white/10 px-8 py-4 rounded-[2rem] backdrop-blur-md border border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Pass Status</p>
                        <p className={`text-2xl font-black uppercase ${isPass ? 'text-green-400' : 'text-red-400'}`}>{status}</p>
                    </div>
                </div>
            </div>

            {/* Quiz Context Bar */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-8 md:mb-12 flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-blue-800">
                <div className="flex items-center bg-white px-3 py-1.5 rounded-lg shadow-sm border border-blue-50">
                    <span className="text-blue-400 mr-2">Topic:</span>
                    {quizId?.language || 'General'}
                </div>
                <div className="flex items-center bg-white px-3 py-1.5 rounded-lg shadow-sm border border-blue-50">
                    <span className="text-blue-400 mr-2">Years:</span>
                    {quizId?.targetYears?.length > 0 ? quizId.targetYears.join(', ') : 'All Years'}
                </div>
                <div className="flex items-center bg-white px-3 py-1.5 rounded-lg shadow-sm border border-blue-50">
                    <span className="text-blue-400 mr-2">Branches:</span>
                    {quizId?.targetBranches?.length > 0 ? quizId.targetBranches.join(', ') : 'All Branches'}
                </div>
                <div className="flex items-center bg-white px-3 py-1.5 rounded-lg shadow-sm border border-blue-50">
                    <span className="text-blue-400 mr-2">Sections:</span>
                    {quizId?.targetSections?.length > 0 ? quizId.targetSections.join(', ') : 'All Sections'}
                </div>
            </div>

            {/* Score Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-12 md:mb-16">
                <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Points Awarded</p>
                    <p className="text-3xl md:text-4xl font-black text-slate-800">{score} / {totalMarks}</p>
                </div>
                <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Calculated Accuracy</p>
                    <p className="text-3xl md:text-4xl font-black text-blue-600">{result?.percentage || 0}%</p>
                </div>
                <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Time Expended</p>
                    <p className="text-3xl md:text-4xl font-black text-slate-800">{Math.floor(timeTaken / 60)}m {timeTaken % 60}s</p>
                </div>
            </div>

            <div className="flex items-center mb-8 md:mb-10">
                <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center">
                    <Zap className="mr-3 text-blue-600" size={20} /> Breakdown
                </h2>
            </div>

            {/* Detailed List */}
            <div className="space-y-6 md:space-y-8">
                {(quizId?.questions || []).map((q, i) => {
                    const qId = q._id || q.id || i.toString();
                    const studentAnswerObj = (answers || []).find(a =>
                        (a.questionId && a.questionId.toString() === qId.toString()) ||
                        (a.id && a.id.toString() === qId.toString())
                    );
                    const studentAnswer = studentAnswerObj?.selectedAnswer;
                    const isCorrect = studentAnswer === q.correctAnswer;

                    return (
                        <div key={i} className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 relative group transition-all duration-300 shadow-sm">
                            <div className="flex justify-between items-start mb-6 md:mb-8">
                                <span className="bg-slate-50 text-slate-400 px-3 py-1 md:px-4 md:py-1.5 rounded-xl text-[9px] md:text-[11px] font-black uppercase tracking-widest leading-none">Question {i + 1}</span>
                                {isCorrect ? (
                                    <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 md:px-4 md:py-1.5 rounded-xl text-[9px] md:text-[11px] font-black uppercase tracking-widest">
                                        <CheckCircle2 size={14} className="mr-1.5 md:mr-2" /> Correct
                                    </div>
                                ) : (
                                    <div className="flex items-center text-red-600 bg-red-50 px-3 py-1 md:px-4 md:py-1.5 rounded-xl text-[9px] md:text-[11px] font-black uppercase tracking-widest">
                                        <XCircle size={14} className="mr-1.5 md:mr-2" /> Incorrect
                                    </div>
                                )}
                            </div>

                            <h3 className="text-lg md:text-xl font-black text-slate-800 mb-6 md:mb-8 tracking-tight leading-tight">{q.question}</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                {q.options.map((opt, idx) => {
                                    const isSelected = opt === studentAnswer;
                                    const isTruth = opt === q.correctAnswer;

                                    let stateClass = 'bg-slate-50/50 border-slate-50 text-slate-400';
                                    if (isTruth) stateClass = 'bg-blue-50/50 border-blue-600 text-blue-900 font-bold';
                                    if (isSelected && !isCorrect) stateClass = 'bg-red-50/50 border-red-600 text-red-900 font-bold';

                                    return (
                                        <div key={idx} className={`p-4 rounded-xl border-2 flex items-center space-x-3 ${stateClass}`}>
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-black text-xs ${isTruth ? 'bg-blue-600 text-white' : isSelected ? 'bg-red-600 text-white' : 'bg-white text-slate-200'}`}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <span className="text-xs md:text-sm">{opt}</span>
                                            {isTruth && <span className="ml-auto text-[7px] md:text-[8px] font-black uppercase bg-blue-600 text-white px-2 py-0.5 rounded-full tracking-widest">Answer</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AttemptReview;
