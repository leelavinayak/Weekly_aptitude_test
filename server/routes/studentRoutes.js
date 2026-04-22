const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getStudentQuizzes } = require('../controllers/quizController');
const { getQuizForAttempt, submitQuiz, getMyResults, getResultDetail } = require('../controllers/studentController');

// Protect student routes
router.use(protect);

router.get('/quizzes', authorize('student'), getStudentQuizzes);
router.get('/quiz/:id', authorize('student'), getQuizForAttempt);
router.post('/quiz/:id/submit', authorize('student'), submitQuiz);
router.get('/results', authorize('student'), getMyResults);
router.get('/results/:id', authorize('student', 'admin'), getResultDetail);
// router.put('/profile', updateProfile); // Moved to global auth route

module.exports = router;
