const supabase = require('../config/supabase');
const { notify } = require('../services/notificationService');
const templates = require('../utils/emailTemplates');

// @desc    Get single quiz details for attempt
const getQuizForAttempt = async (req, res) => {
    try {
        const { data: quiz, error } = await supabase
            .from('quizzes')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error || !quiz) return res.status(404).json({ message: 'Quiz not found' });

        const { data: existingAttempt } = await supabase
            .from('quiz_attempts')
            .select('id')
            .eq('studentId', req.user.id)
            .eq('quizId', quiz.id)
            .single();

        if (existingAttempt) {
            return res.status(400).json({ message: 'Quiz already attempted' });
        }

        const now = new Date();
        if (!quiz.isLive && quiz.scheduledAt && new Date(quiz.scheduledAt) > now) {
            return res.status(400).json({ message: `This quiz is scheduled for ${new Date(quiz.scheduledAt).toLocaleString()} and cannot be started yet.` });
        }

        notify(req.user.id, 'info', 'Quiz Started', `You have started "${quiz.title}".`, {
            html: templates.getAttemptStartedTemplate(quiz.title, req.user.name)
        });

        notify(quiz.createdBy, 'info', 'Student Attempt Started', `${req.user.name} has started "${quiz.title}".`, {
            html: templates.getAttemptStartedTemplate(quiz.title, req.user.name, true)
        });

        // Map id to _id for frontend
        quiz._id = quiz.id;
        if (quiz.questions) {
            quiz.questions = quiz.questions.map((q, idx) => ({
                ...q,
                _id: q._id || idx.toString()
            }));
        }

        res.json(quiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit quiz answers
const submitQuiz = async (req, res) => {
    const { answers, timeTaken, isDisqualified } = req.body;
    try {
        const { data: quiz } = await supabase
            .from('quizzes')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        let score = 0;
        let status = 'fail';
        let percentage = 0;

        if (isDisqualified) {
            status = 'disqualified';
        } else {
            quiz.questions.forEach((q, idx) => {
                // In Supabase/JSONB, questions might not have _id if not explicitly added, 
                // we'll rely on index or question text if needed, but assuming schema matches.
                const answer = answers.find((a) => a.questionId === (q.id || idx.toString()));
                if (answer && answer.selectedAnswer === q.correctAnswer) {
                    score++;
                }
            });

            percentage = (score / quiz.questions.length) * 100;
            status = percentage >= quiz.passingScore ? 'pass' : 'fail';
        }

        const { data: attempt, error } = await supabase
            .from('quiz_attempts')
            .insert([{
                studentId: req.user.id,
                quizId: req.params.id,
                answers,
                score,
                totalMarks: quiz.questions.length,
                percentage,
                timeTaken,
                status
            }])
            .select()
            .single();

        if (error) throw error;

        const mappedAttempt = {
            ...attempt,
            _id: attempt.id
        };

        notify(req.user.id, status === 'pass' ? 'success' : 'warning', 'Assessment Finalized', `You completed "${quiz.title}" with a score of ${percentage}%.`, {
            html: templates.getQuizResultTemplate(quiz.title, req.user.name, score, Math.round(percentage), status)
        });

        notify(quiz.createdBy, 'info', 'New Assessment Result', `${req.user.name} finalized "${quiz.title}" with ${percentage}%.`, {
            html: templates.getQuizResultTemplate(quiz.title, req.user.name, score, Math.round(percentage), status)
        });

        res.status(201).json(mappedAttempt);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all results for logged-in student
const getMyResults = async (req, res) => {
    try {
        const limitRes = req.query.limit;
        const limitValue = (limitRes && limitRes !== 'all') ? parseInt(limitRes) : 1000;

        const { data: results, error } = await supabase
            .from('quiz_attempts')
            .select('*, quizId:quizzes(title, language)')
            .eq('studentId', req.user.id)
            .order('submittedAt', { ascending: false })
            .limit(limitValue);

        if (error) throw error;
        
        const mappedResults = results?.map(r => ({
            ...r,
            _id: r.id,
            quizId: r.quizId ? { ...r.quizId, _id: r.quizId.id } : null
        })) || [];

        res.json(mappedResults);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single detailed result
const getResultDetail = async (req, res) => {
    try {
        const { data: result, error } = await supabase
            .from('quiz_attempts')
            .select('*, quiz:quizzes(id, title, language, questions), student:users(id, name, email)')
            .eq('id', req.params.id)
            .single();

        if (error || !result) return res.status(404).json({ message: 'Result not found' });

        // Map for frontend compatibility
        const mappedResult = {
            ...result,
            _id: result.id,
            quizId: result.quiz ? { ...result.quiz, _id: result.quiz.id } : null,
            studentId: result.student ? { ...result.student, _id: result.student.id } : result.studentId
        };

        if (result.studentId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(mappedResult);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getQuizForAttempt,
    submitQuiz,
    getMyResults,
    getResultDetail
};
