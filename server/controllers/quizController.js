const supabase = require('../config/supabase');
const { generateQuizQuestions } = require('../services/quizGenerator');
const { notifyAllStudents, notify } = require('../services/notificationService');
const templates = require('../utils/emailTemplates');

// @desc    Generate quiz questions via AI
const generateAIQuestions = async (req, res) => {
    const { language, numQuestions, difficulty } = req.body;
    try {
        if (!language) {
            return res.status(400).json({ message: 'Topic/Language is required' });
        }
        const questions = await generateQuizQuestions(language, numQuestions || 10, difficulty || 'medium');
        res.json(questions);
    } catch (error) {
        console.error('Quiz Generation Error:', error.message);
        let status = 500;
        let message = error.message;
        if (message.includes('API_KEY')) {
            message = 'AI Service is currently unavailable.';
            status = 401;
        }
        res.status(status).json({ message });
    }
};

// @desc    Upload/Create a new quiz
const createQuiz = async (req, res) => {
    try {
        const { title, language, questions, duration, scheduledAt, endTime, passingScore } = req.body;

        const { data: quiz, error } = await supabase
            .from('quizzes')
            .insert([{
                title,
                language,
                questions,
                duration,
                scheduledAt: scheduledAt || null,
                endTime: endTime || null,
                isLive: scheduledAt ? false : true,
                passingScore,
                createdBy: req.user.id
            }])
            .select()
            .single();

        if (error) throw error;
        
        // Notify the Admin (Confirmation)
        await notify(
            req.user.id, 
            'success', 
            'Quiz Created', 
            `You have successfully ${scheduledAt ? 'scheduled' : 'published'} "${title}".`
        );

        // Notify All Students
        const isFuture = scheduledAt && new Date(scheduledAt) > new Date();
        const notificationMessage = isFuture 
            ? `A new quiz "${title}" has been scheduled for ${new Date(scheduledAt).toLocaleString()}.`
            : `A new quiz "${title}" is now available for you.`;

        notifyAllStudents(
            isFuture ? 'New Quiz Scheduled' : 'New Assessment Published',
            notificationMessage,
            templates.getNewQuizTemplate(title, language)
        );

        res.status(201).json(quiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all quizzes (for admin)
const getAdminQuizzes = async (req, res) => {
    try {
        const { data: quizzes, error } = await supabase
            .from('quizzes')
            .select('*')
            .eq('createdBy', req.user.id)
            .order('createdAt', { ascending: false });
        
        if (error) throw error;
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get available quizzes for students
const getStudentQuizzes = async (req, res) => {
    try {
        const now = new Date().toISOString();
        
        // Quizzes that haven't ended yet
        const { data: quizzes, error } = await supabase
            .from('quizzes')
            .select('*')
            .or(`endTime.gte.${now},endTime.is.null`)
            .order('createdAt', { ascending: false });

        if (error) throw error;

        // Filter and add attempt status
        const enhancedQuizzes = await Promise.all(quizzes.map(async (quiz) => {
            const { data: attempt } = await supabase
                .from('quiz_attempts')
                .select('id')
                .eq('studentId', req.user.id)
                .eq('quizId', quiz.id)
                .single();

            // Ensure questions have _id for frontend compatibility
            const questionsWithId = quiz.questions?.map((q, idx) => ({
                ...q,
                _id: q._id || idx.toString()
            })) || [];

            return {
                ...quiz,
                _id: quiz.id,
                questions: questionsWithId,
                isAttempted: !!attempt,
                attemptId: attempt ? attempt.id : null
            };
        }));

        res.json(enhancedQuizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    generateAIQuestions,
    createQuiz,
    getAdminQuizzes,
    getStudentQuizzes
};
