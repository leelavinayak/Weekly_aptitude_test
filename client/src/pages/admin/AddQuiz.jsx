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
    AlertCircle,
    Pencil
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

const AddQuiz = () => {
    const [step, setStep] = useState(1); // 1: Setup, 2: Review, 3: Publish
    const [loading, setLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState('');
    const [quizData, setQuizData] = useState({
        title: '',
        language: '',
        numQuestions: 10,
        passingScore: 60,
        questions: [],
        duration: 30,
        scheduledAt: '',
        endTime: '',
        expiryHours: 24, // Default to 24 hours
        targetYears: [], // e.g. ['1', '2']
        targetBranches: [], // e.g. ['CSE', 'ECE']
        targetSections: [] // e.g. ['A', 'B']
    });

    // Editor States
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState(-1);
    const [tempQuestion, setTempQuestion] = useState({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: ''
    });

    const openEditor = (index = -1) => {
        if (index === -1) {
            setTempQuestion({
                question: '',
                options: ['', '', '', ''],
                correctAnswer: ''
            });
            setEditingIndex(-1);
        } else {
            setTempQuestion({ ...quizData.questions[index] });
            setEditingIndex(index);
        }
        setIsEditorOpen(true);
    };

    const saveQuestion = () => {
        if (!tempQuestion.question || tempQuestion.options.some(o => !o) || !tempQuestion.correctAnswer) {
            toast.error('Please fill all fields and select the correct answer');
            return;
        }

        const newQuestions = [...quizData.questions];
        if (editingIndex === -1) {
            newQuestions.push(tempQuestion);
        } else {
            newQuestions[editingIndex] = tempQuestion;
        }

        setQuizData({ ...quizData, questions: newQuestions });
        setIsEditorOpen(false);
        toast.success(editingIndex === -1 ? 'Question Added' : 'Question Updated');
    };

    const navigate = useNavigate();
    const [creationMode, setCreationMode] = useState('ai'); // 'ai' or 'pdf'
    const [selectedFile, setSelectedFile] = useState(null);

    const handleAnalyzePDF = async () => {
        if (!selectedFile || !quizData.title) {
            toast.error('Please provide a title and a PDF file');
            return;
        }
        
        const formData = new FormData();
        formData.append('pdf', selectedFile);
        formData.append('numQuestions', quizData.numQuestions);
        formData.append('title', quizData.title);

        setLoading(true);
        setLoadingStatus('Uploading & reading PDF...');
        try {
            const { data } = await api.post('/admin/quiz/analyze-pdf', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setLoadingStatus('AI is extracting questions...');
            setQuizData({ ...quizData, questions: data });
            setStep(2);
            toast.success('PDF Analyzed Successfully!');
        } catch (err) {
            console.error('PDF Analysis Error:', err);
            toast.error(err.response?.data?.message || 'Failed to analyze PDF');
        } finally {
            setLoading(false);
            setLoadingStatus('');
        }
    };

    const handleGenerate = async () => {
        if (!quizData.title || !quizData.language) {
            toast.error('Please fill all fields');
            return;
        }
        setLoading(true);
        setLoadingStatus('AI is generating questions...');
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
            setLoadingStatus('');
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
                endTime: finalEndTime,
                targetYears: quizData.targetYears,
                targetBranches: quizData.targetBranches,
                targetSections: quizData.targetSections
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
                        <div className="space-y-8 animate-scale-up">
                            {/* Mode Selection */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setCreationMode('ai')}
                                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center ${creationMode === 'ai' ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100' : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200'}`}
                                >
                                    <Sparkles size={32} className={creationMode === 'ai' ? 'text-white' : 'text-blue-600'} />
                                    <span className="font-black uppercase tracking-widest text-xs mt-3">AI Topic Generator</span>
                                </button>
                                <button
                                    onClick={() => setCreationMode('pdf')}
                                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center ${creationMode === 'pdf' ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200'}`}
                                >
                                    <Upload size={32} className={creationMode === 'pdf' ? 'text-white' : 'text-slate-900'} />
                                    <span className="font-black uppercase tracking-widest text-xs mt-3">PDF Source Extractor</span>
                                </button>
                            </div>

                            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                {/* Eligibility Targeting */}
                            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
                                <div className="flex items-center space-x-4 mb-2">
                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                        <Plus size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Student Eligibility</h3>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Select which students can attend</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                    {/* Years */}
                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Years</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['1', '2', '3', '4'].map(year => (
                                                <button
                                                    key={year}
                                                    onClick={() => {
                                                        const current = quizData.targetYears;
                                                        const next = current.includes(year) ? current.filter(y => y !== year) : [...current, year];
                                                        setQuizData({ ...quizData, targetYears: next });
                                                    }}
                                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-2 ${quizData.targetYears.includes(year) ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                                                >
                                                    {year}{year === '1' ? 'st' : year === '2' ? 'nd' : year === '3' ? 'rd' : 'th'} Year
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Branches */}
                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Branches</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIML', 'AI', 'AIDS'].map(branch => (
                                                <button
                                                    key={branch}
                                                    onClick={() => {
                                                        const current = quizData.targetBranches;
                                                        const next = current.includes(branch) ? current.filter(b => b !== branch) : [...current, branch];
                                                        setQuizData({ ...quizData, targetBranches: next });
                                                    }}
                                                    className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all border-2 ${quizData.targetBranches.includes(branch) ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                                                >
                                                    {branch}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Sections */}
                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Sections</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(section => (
                                                <button
                                                    key={section}
                                                    onClick={() => {
                                                        const current = quizData.targetSections;
                                                        const next = current.includes(section) ? current.filter(s => s !== section) : [...current, section];
                                                        setQuizData({ ...quizData, targetSections: next });
                                                    }}
                                                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all border-2 flex items-center justify-center ${quizData.targetSections.includes(section) ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                                                >
                                                    {section}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start space-x-3">
                                    <AlertCircle size={18} className="text-blue-500 mt-0.5" />
                                    <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
                                        If no selections are made for a category, the quiz will be available to <span className="font-black">ALL students</span> in that category by default.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Quiz Title</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="e.g. Weekly Aptitude Test - Set A"
                                            value={quizData.title}
                                            onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Core Topic / Subject</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="e.g. Python Programming, AWS Cloud, etc."
                                            value={quizData.language}
                                            onChange={(e) => setQuizData({ ...quizData, language: e.target.value })}
                                        />
                                    </div>

                                    {creationMode === 'pdf' && (
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Upload PDF Source</label>
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept=".pdf"
                                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                                    className="absolute opacity-0 -z-10"
                                                    id="pdf-upload"
                                                />
                                                <label 
                                                    htmlFor="pdf-upload"
                                                    className="flex items-center justify-between input-field cursor-pointer hover:border-blue-400 transition-colors"
                                                >
                                                    <span className="truncate">{selectedFile ? selectedFile.name : 'Select PDF File...'}</span>
                                                    <Upload size={18} className="text-slate-400" />
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Total Questions</label>
                                        <input
                                            type="number"
                                            className="input-field"
                                            value={quizData.numQuestions}
                                            onChange={(e) => setQuizData({ ...quizData, numQuestions: e.target.value })}
                                        />
                                    </div>

                                    <div className="md:col-span-2 grid grid-cols-2 gap-8">
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
                                    </div>

                                    {creationMode === 'ai' && (
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
                                    )}
                                </div>

                                <button
                                    onClick={creationMode === 'ai' ? handleGenerate : handleAnalyzePDF}
                                    disabled={loading}
                                    className={`w-full mt-10 flex flex-col items-center justify-center py-5 text-xl rounded-3xl font-black transition-all ${
                                        creationMode === 'ai' 
                                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-100' 
                                        : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200'
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        {loading ? <Loader2 className="animate-spin" /> : (creationMode === 'ai' ? <Sparkles size={24} /> : <Upload size={24} />)}
                                        <span>{creationMode === 'ai' ? 'Generate with AI' : 'Analyze & Extract PDF'}</span>
                                    </div>
                                    {loading && loadingStatus && (
                                        <span className="text-[10px] mt-2 font-bold uppercase tracking-widest text-white/70 animate-pulse">
                                            {loadingStatus}
                                        </span>
                                    )}
                                </button>
                            </div>
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
                                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => openEditor(i)}
                                                    className="p-2 text-blue-400 hover:text-blue-600 transition-colors"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        const newQuestions = quizData.questions.filter((_, idx) => idx !== i);
                                                        setQuizData({ ...quizData, questions: newQuestions });
                                                    }}
                                                    className="p-2 text-red-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
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

                                <button 
                                    onClick={() => openEditor()}
                                    className="w-full py-8 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-black uppercase tracking-widest hover:border-blue-400 hover:text-blue-600 transition-all flex flex-col items-center justify-center space-y-3"
                                >
                                    <Plus size={32} />
                                    <span>Add Question Manually</span>
                                </button>
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

            {/* Question Editor Modal */}
            {isEditorOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsEditorOpen(false)}></div>
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden animate-scale-up">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                                {editingIndex === -1 ? 'Add New Question' : `Edit Question ${editingIndex + 1}`}
                            </h2>
                            <button onClick={() => setIsEditorOpen(false)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Question Description</label>
                                <textarea
                                    className="input-field min-h-[100px] py-4 resize-none"
                                    placeholder="Enter the question text here..."
                                    value={tempQuestion.question}
                                    onChange={(e) => setTempQuestion({ ...tempQuestion, question: e.target.value })}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Options (Click circle to set as correct)</label>
                                {tempQuestion.options.map((opt, i) => (
                                    <div key={i} className="flex items-center space-x-4 group">
                                        <button
                                            onClick={() => setTempQuestion({ ...tempQuestion, correctAnswer: tempQuestion.options[i] })}
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border-2 ${tempQuestion.correctAnswer === tempQuestion.options[i] && tempQuestion.options[i] !== '' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-300 hover:border-blue-200'}`}
                                        >
                                            {tempQuestion.correctAnswer === tempQuestion.options[i] && tempQuestion.options[i] !== '' ? <CheckCircle2 size={20} /> : <span className="font-black">{String.fromCharCode(65 + i)}</span>}
                                        </button>
                                        <input
                                            type="text"
                                            className={`flex-1 input-field py-3 transition-all ${tempQuestion.correctAnswer === tempQuestion.options[i] && tempQuestion.options[i] !== '' ? 'border-blue-200 bg-blue-50/30' : ''}`}
                                            placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                            value={opt}
                                            onChange={(e) => {
                                                const newOptions = [...tempQuestion.options];
                                                newOptions[i] = e.target.value;
                                                setTempQuestion({ ...tempQuestion, options: newOptions });
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex space-x-4">
                            <button onClick={() => setIsEditorOpen(false)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-100 transition-all">
                                Cancel
                            </button>
                            <button onClick={saveQuestion} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddQuiz;
