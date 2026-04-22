const supabase = require('../config/supabase');
const { notify } = require('../services/notificationService');

// @desc    Get dashboard stats
const getDashboardStats = async (req, res) => {
    try {
        const { count: totalStudents } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'student');

        const { count: totalQuizzes } = await supabase
            .from('quizzes')
            .select('*', { count: 'exact', head: true });

        const { count: totalAttempts } = await supabase
            .from('quiz_attempts')
            .select('*', { count: 'exact', head: true });

        const { data: attempts } = await supabase
            .from('quiz_attempts')
            .select('status, percentage');

        const passAttempts = attempts ? attempts.filter(a => a.status === 'pass').length : 0;
        const passRate = totalAttempts > 0 ? (passAttempts / totalAttempts) * 100 : 0;

        // Quiz-wise average scores
        const { data: quizStatsRaw } = await supabase
            .from('quiz_attempts')
            .select('quizId, percentage, quiz:quizzes(title)');

        const quizStatsMap = {};
        quizStatsRaw?.forEach(a => {
            const title = a.quiz?.title || 'Unknown';
            const quizId = a.quizId;
            if (!quizStatsMap[title]) quizStatsMap[title] = { id: quizId, title, total: 0, count: 0 };
            quizStatsMap[title].total += a.percentage;
            quizStatsMap[title].count += 1;
        });
        const quizStats = Object.values(quizStatsMap).map(q => ({
            id: q.id,
            title: q.title,
            avgScore: q.total / q.count
        }));

        // Top attempts (highest score, lowest time)
        const { data: recentAttemptsRaw } = await supabase
            .from('quiz_attempts')
            .select('*, student:users(id, name, email), quiz:quizzes(id, title)')
            .order('percentage', { ascending: false })
            .order('timeTaken', { ascending: true })
            .limit(30);

        const recentAttempts = recentAttemptsRaw?.map(a => ({
            ...a,
            _id: a.id,
            studentId: a.student ? { ...a.student, _id: a.student.id } : null,
            quizId: a.quiz ? { ...a.quiz, _id: a.quiz.id } : null
        })) || [];

        res.json({
            stats: {
                totalStudents: totalStudents || 0,
                totalQuizzes: totalQuizzes || 0,
                totalAttempts: totalAttempts || 0,
                passRate: Math.round(passRate)
            },
            quizStats,
            recentAttempts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all students
const getAllStudents = async (req, res) => {
    try {
        const { data: students, error } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'student');

        if (error) throw error;

        const enhancedStudents = await Promise.all(students.map(async (student) => {
            const { data: attempts } = await supabase
                .from('quiz_attempts')
                .select('percentage')
                .eq('studentId', student.id);

            const avgScore = (attempts && attempts.length > 0)
                ? attempts.reduce((acc, curr) => acc + curr.percentage, 0) / attempts.length
                : 0;

            return {
                ...student,
                _id: student.id, // For frontend compatibility
                totalAttempts: attempts ? attempts.length : 0,
                averageScore: Math.round(avgScore)
            };
        }));

        res.json(enhancedStudents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete student
const deleteStudent = async (req, res) => {
    try {
        const { error: attemptError } = await supabase.from('quiz_attempts').delete().eq('studentId', req.params.id);
        const { error: userError } = await supabase.from('users').delete().eq('id', req.params.id);

        if (userError) throw userError;
        res.json({ message: 'User and all associated data deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all quiz attempts
const getAllAttempts = async (req, res) => {
    try {
        const limitRes = req.query.limit;
        const limitValue = (limitRes && limitRes !== 'all') ? parseInt(limitRes) : 1000;

        const { data: attemptsRaw, error } = await supabase
            .from('quiz_attempts')
            .select('*, studentId:users(id, name, email), quizId:quizzes(id, title)')
            .order('submittedAt', { ascending: false })
            .limit(limitValue);

        if (error) throw error;

        const attempts = attemptsRaw?.map(a => ({
            ...a,
            _id: a.id,
            studentId: { ...a.studentId, _id: a.studentId.id },
            quizId: { ...a.quizId, _id: a.quizId.id }
        })) || [];

        res.json(attempts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update student details
const updateStudent = async (req, res) => {
    try {
        const updates = {
            name: req.body.name,
            email: req.body.email,
            collegeId: req.body.collegeId,
            collegeName: req.body.collegeName,
            branch: req.body.branch,
            year: req.body.year
        };

        const { data: updatedStudent, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;

        await notify(req.params.id, 'info', 'Profile Updated', 'An administrator has updated your profile details.');
        res.json(updatedStudent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getStudentDetail = async (req, res) => {
    try {
        const { data: student } = await supabase.from('users').select('*').eq('id', req.params.id).single();
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const { data: historyRaw } = await supabase
            .from('quiz_attempts')
            .select('*, quiz:quizzes(id, title, language)')
            .eq('studentId', student.id)
            .order('submittedAt', { ascending: false });

        const history = historyRaw?.map(h => ({
            ...h,
            _id: h.id,
            quizId: h.quiz ? { ...h.quiz, _id: h.quiz.id } : null
        })) || [];

        const totalAttempts = history ? history.length : 0;
        const avgScore = totalAttempts > 0
            ? history.reduce((acc, curr) => acc + curr.percentage, 0) / totalAttempts
            : 0;
        const passRank = history ? history.filter(h => h.status === 'pass').length : 0;

        res.json({
            student,
            history,
            metrics: {
                totalAttempts,
                averageScore: Math.round(avgScore),
                passRank
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getAllStudents,
    deleteStudent,
    getAllAttempts,
    updateStudent,
    getStudentDetail
};
