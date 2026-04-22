import React, { useState } from 'react';
import api from '../../services/api';
import {
    Sparkles,
    Plus,
    Trash2,
    Download,
    Upload,
    Clock,
    CheckCircle2,
    Loader2,
    ChevronLeft,
    AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

const AddQuiz = () => {
    const [step, setStep] = useState(1); // 1: Setup, 2: Review, 3: Publish
    const [loading, setLoading] = useState(false);
    const [quizData, setQuizData] = useState({
        title: '',
        language: '',
        numQuestions: 10,
        passingScore: 60,
        questions: [],
        duration: 30,
        scheduledAt: '',
        endTime: '',
        expiryHours: 24 // Default to 24 hours
    });
    const navigate = useNavigate();

    const handleGenerate = async () => {
        if (!quizData.title || !quizData.language) {
            toast.error('Please fill all fields');
            return;
        }
        setLoading(true);
        try {
            const { data } = await api.post('/admin/quiz/generate', {
                language: quizData.language,
                numQuestions: quizData.numQuestions,
                difficulty: quizData.difficulty || 'medium'
            });
            setQuizData({ ...quizData, questions: data });
            setStep(2);
        } catch (err) {
            console.error('Generation Error:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Unknown error occurred';
            toast.error(`Generation Failed: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (isInstant) => {
        setLoading(true);
        try {
            // Convert local datetime-local strings to UTC ISO strings for backend consistency
            let finalScheduledAt = isInstant 
                ? new Date().toISOString() 
                : (quizData.scheduledAt ? new Date(quizData.scheduledAt).toISOString() : null);
            
            let finalEndTime = quizData.endTime 
                ? new Date(quizData.endTime).toISOString() 
                : null;

            // If no specific end time is chosen but expiryHours are set, calculate it
            if (!finalEndTime && quizData.expiryHours) {
                const startDate = isInstant ? new Date() : new Date(quizData.scheduledAt);
                // Only calculate if we have a valid start date
                if (!isNaN(startDate.getTime())) {
                    finalEndTime = new Date(startDate.getTime() + quizData.expiryHours * 60 * 60 * 1000).toISOString();
                }
            }

            await api.post('/admin/quiz/upload', {
                ...quizData,
                scheduledAt: finalScheduledAt,
                endTime: finalEndTime
            });
            toast.success('Quiz Published successfully!');
            navigate('/admin/dashboard');
        } catch (err) {
            toast.error('Upload failed');
        } finally {
            setLoading(false);
        }
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let y = 20;

        // Header
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text(quizData.title.toUpperCase(), pageWidth / 2, y, { align: 'center' });

        y += 15;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Topic: ${quizData.language} | Questions: ${quizData.numQuestions} | Duration: ${quizData.duration}m`, pageWidth / 2, y, { align: 'center' });

        y += 20;
        doc.setLineWidth(0.5);
        doc.line(15, y, pageWidth - 15, y);
        y += 15;

        // Questions
        quizData.questions.forEach((q, i) => {
            if (y > 250) {
                doc.addPage();
                y = 20;
            }

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            const splitQuestion = doc.splitTextToSize(`${i + 1}. ${q.question}`, pageWidth - 30);
            doc.text(splitQuestion, 15, y);
            y += (splitQuestion.length * 7);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            q.options.forEach((opt, oi) => {
                const label = String.fromCharCode(65 + oi);
                doc.text(`   [${label}] ${opt}`, 20, y);
                y += 7;
            });

            doc.setFont('helvetica', 'bolditalic');
            doc.setTextColor(37, 99, 235); // Blue color
            doc.text(`   ✓ Correct Answer: ${q.correctAnswer}`, 20, y);
            doc.setTextColor(0, 0, 0); // Reset to black
            y += 15;
        });

        // Add Answer Key Page
        doc.addPage();
        y = 30;
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(37, 99, 235);
        doc.text('FINAL ANSWER KEY', pageWidth / 2, y, { align: 'center' });

        y += 20;
        doc.setLineWidth(0.5);
        doc.setDrawColor(226, 232, 240);
        doc.line(20, y, pageWidth - 20, y);
        y += 20;

        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42); // Slate 900
        quizData.questions.forEach((q, i) => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            doc.setFont('helvetica', 'bold');
            doc.text(`Q${i + 1}:`, 20, y);
            doc.setFont('helvetica', 'normal');
            doc.text(`${q.correctAnswer}`, 40, y);
            y += 10;
        });

        doc.save(`${quizData.title.replace(/\s+/g, '_')}_Master_Copy.pdf`);
    };

    return (
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col items-center w-full">
                <div className="w-full max-w-5xl px-6 pt-12 pb-20">
                    {/* Header */}
                    <div className="flex items-center space-x-6 mb-12 animate-fade-in text-center md:text-left">
                        <button onClick={() => navigate(-1)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100">
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-4xl font-black text-slate-800 tracking-tight">AI Quiz Generator</h1>
                            <p className="text-slate-500 mt-1 font-bold text-lg">Step {step}: {step === 1 ? 'Configure setup' : step === 2 ? 'Review AI content' : 'Choose launch'}</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex space-x-3 mb-16 animate-fade-in">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex-1">
                                <div className={`h-2 rounded-full transition-all duration-700 ${step >= s ? 'bg-blue-600' : 'bg-slate-100'}`}></div>
                                <p className={`text-[10px] uppercase font-black tracking-widest mt-3 ${step >= s ? 'text-blue-600' : 'text-slate-300'}`}>
                                    {s === 1 ? 'Setup' : s === 2 ? 'Questions' : 'Publish'}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Step 1: Setup */}
                    {step === 1 && (
                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm animate-scale-up">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Quiz Title</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="e.g. Master React Hooks"
                                        value={quizData.title}
                                        onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Core Topic / Language</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="e.g. Machine Learning, Ancient History, etc."
                                        value={quizData.language}
                                        onChange={(e) => setQuizData({ ...quizData, language: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Total Questions</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={quizData.numQuestions}
                                        onChange={(e) => setQuizData({ ...quizData, numQuestions: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Passing Mark (%)</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={quizData.passingScore}
                                        onChange={(e) => setQuizData({ ...quizData, passingScore: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Timer (Minutes)</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={quizData.duration}
                                        onChange={(e) => setQuizData({ ...quizData, duration: e.target.value })}
                                    />
                                </div>

                                {/* Difficulty Level */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Difficulty Level</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[
                                            { value: 'easy',   label: 'Easy',   emoji: '🟢', desc: 'Basic concepts' },
                                            { value: 'medium', label: 'Medium', emoji: '🟡', desc: 'Intermediate' },
                                            { value: 'hard',   label: 'Hard',   emoji: '🔴', desc: 'Advanced' },
                                            { value: 'mixed',  label: 'Mixed',  emoji: '🎯', desc: 'All levels' },
                                        ].map(({ value, label, emoji, desc }) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => setQuizData({ ...quizData, difficulty: value })}
                                                className={`flex flex-col items-center justify-center py-4 px-3 rounded-2xl border-2 font-bold transition-all duration-200 ${
                                                    quizData.difficulty === value
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                                                        : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-blue-200 hover:bg-blue-50'
                                                }`}
                                            >
                                                <span className="text-2xl mb-1">{emoji}</span>
                                                <span className="font-black uppercase tracking-widest text-[11px]">{label}</span>
                                                <span className={`text-[10px] mt-0.5 ${quizData.difficulty === value ? 'text-blue-100' : 'text-slate-400'}`}>{desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="btn-blue w-full mt-10 flex items-center justify-center space-x-3 py-5 text-xl"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={24} />}
                                <span>Generate with AI</span>
                            </button>
                        </div>
                    )}

                    {/* Step 2: Review */}
                    {step === 2 && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex justify-between items-center">
                                <h2 className="text-xl font-black text-blue-900 flex items-center tracking-tight">
                                    <CheckCircle2 className="text-blue-600 mr-3" /> AI Generated Content
                                </h2>
                                <button onClick={exportToPDF} className="flex items-center space-x-2 text-blue-600 font-black text-xs uppercase tracking-widest transition-all hover:scale-105">
                                    <Download size={20} /> <span>Download PDF</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {quizData.questions.map((q, i) => (
                                    <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative group hover:shadow-xl hover:shadow-blue-50 transition-all duration-300">
                                        <div className="flex justify-between items-start mb-6">
                                            <span className="bg-slate-100 text-slate-400 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-50">Question {i + 1}</span>
                                            <button className="text-red-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={20} /></button>
                                        </div>
                                        <h3 className="font-black text-slate-800 text-xl mb-8 leading-tight tracking-tight">{q.question}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {q.options.map((opt, oi) => (
                                                <div key={oi} className={`p-4 rounded-2xl border-2 text-sm font-bold flex items-center transition-all ${opt === q.correctAnswer ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-slate-50 border-transparent text-slate-500'}`}>
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${opt === q.correctAnswer ? 'bg-blue-600 text-white' : 'bg-white text-slate-300'}`}>
                                                        {String.fromCharCode(65 + oi)}
                                                    </div>
                                                    {opt}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex space-x-6 mt-12">
                                <button onClick={() => setStep(1)} className="flex-1 btn-outline-blue py-5 text-xl">Edit Setup</button>
                                <button onClick={() => setStep(3)} className="flex-1 btn-blue py-5 text-xl">Proceed to Publish</button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Publish */}
                    {step === 3 && (
                        <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm animate-scale-up text-center max-w-2xl mx-auto">
                            <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner rotate-3">
                                <Upload size={48} />
                            </div>
                            <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Final Launch</h2>
                            <p className="text-slate-500 mb-12 font-bold text-lg leading-relaxed">Your quiz is optimized and ready. Choose to publish for all students or schedule for a future slot.</p>

                            <div className="grid grid-cols-1 gap-6 mb-12">
                                <div className="p-8 rounded-[2rem] border-2 border-slate-100 bg-white flex flex-col items-center group">
                                    <div className="bg-blue-50 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                                        <Sparkles className="text-blue-600" size={32} />
                                    </div>
                                    <h3 className="font-black text-slate-800 text-xl mb-4 tracking-tight">Set Visibility Window</h3>

                                    <div className="w-full space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-left">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Available From</label>
                                                <input
                                                    type="datetime-local"
                                                    className="input-field"
                                                    value={quizData.scheduledAt}
                                                    onChange={(e) => setQuizData({ ...quizData, scheduledAt: e.target.value })}
                                                />
                                                <p className="text-[8px] text-slate-400 mt-1 ml-1 uppercase font-bold">Leave blank for instant</p>
                                            </div>
                                            <div className="text-left">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Specific Expiry Time</label>
                                                <input
                                                    type="datetime-local"
                                                    className="input-field border-red-100 focus:border-red-500"
                                                    value={quizData.endTime}
                                                    onChange={(e) => setQuizData({ ...quizData, endTime: e.target.value })}
                                                />
                                                <p className="text-[8px] text-red-400 mt-1 ml-1 uppercase font-bold text-center">Overrides Duration</p>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Or Auto-Expire After (Hours)</label>
                                            <div className="flex items-center space-x-4">
                                                <input
                                                    type="number"
                                                    className="input-field py-2 text-center text-lg"
                                                    value={quizData.expiryHours}
                                                    onChange={(e) => setQuizData({ ...quizData, expiryHours: parseInt(e.target.value) })}
                                                    min="1"
                                                    max="720"
                                                />
                                                <div className="flex flex-wrap gap-2">
                                                    {[2, 4, 24, 48].map(h => (
                                                        <button
                                                            key={h}
                                                            onClick={() => setQuizData({ ...quizData, expiryHours: h })}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-tighter transition-all ${quizData.expiryHours === h ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}
                                                        >
                                                            {h}H
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex space-x-3 pt-4">
                                            <button
                                                onClick={() => handleUpload(true)}
                                                className="flex-1 bg-blue-50 text-blue-600 rounded-2xl py-4 font-black hover:bg-blue-600 hover:text-white transition-all border border-blue-100 hover:shadow-xl hover:shadow-blue-100"
                                            >
                                                Publish Instantly
                                            </button>
                                            <button
                                                onClick={() => handleUpload(false)}
                                                className="flex-1 bg-slate-900 text-white rounded-2xl py-4 font-black hover:bg-slate-800 transition-all disabled:opacity-50"
                                                disabled={!quizData.scheduledAt}
                                            >
                                                Schedule Timing
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => setStep(2)} className="text-slate-400 font-bold hover:text-blue-600 transition-colors uppercase text-xs tracking-widest">
                                ← Back to Review
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddQuiz;
