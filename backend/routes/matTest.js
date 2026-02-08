const express = require('express');
const router = express.Router();
const MATTest = require('../models/MATTest');
const MATQuestion = require('../models/MATQuestion');
const { v4: uuidv4 } = require('uuid');

// GET: Start a new MAT topic test
// Creates test session and returns questions for the module
router.post('/create-test', async (req, res) => {
  try {
    const { studentId, module, questionsCount = 10 } = req.body;

    if (!studentId || !module) {
      return res.status(400).json({ error: 'छात्र ID और मॉड्यूल आवश्यक हैं' });
    }

    // Fetch questions for the module
    const allQuestions = await MATQuestion.find({ module })
      .select('-__v')
      .lean();

    if (allQuestions.length === 0) {
      return res.status(404).json({ error: 'इस मॉड्यूल के लिए कोई प्रश्न नहीं मिला' });
    }

    // Randomly select questions (mix of difficulties)
    const easyQuestions = allQuestions.filter(q => q.difficulty === 'Easy');
    const mediumQuestions = allQuestions.filter(q => q.difficulty === 'Medium');
    const hardQuestions = allQuestions.filter(q => q.difficulty === 'Hard');

    // Distribution: 40% easy, 40% medium, 20% hard
    const easyCount = Math.ceil(questionsCount * 0.4);
    const mediumCount = Math.ceil(questionsCount * 0.4);
    const hardCount = questionsCount - easyCount - mediumCount;

    const selectedQuestions = [
      ...shuffleArray(easyQuestions).slice(0, Math.min(easyCount, easyQuestions.length)),
      ...shuffleArray(mediumQuestions).slice(0, Math.min(mediumCount, mediumQuestions.length)),
      ...shuffleArray(hardQuestions).slice(0, Math.min(hardCount, hardQuestions.length))
    ];

    // Shuffle final question order
    const finalQuestions = shuffleArray(selectedQuestions);

    // Create test document
    const testId = `MAT-${Date.now()}-${uuidv4().substring(0, 8)}`;
    const newTest = new MATTest({
      testId,
      studentId,
      module,
      totalQuestions: finalQuestions.length,
      startTime: new Date(),
      timeLimit: finalQuestions.length * 60, // 60 seconds per question
      questionAnalytics: finalQuestions.map((q, index) => ({
        questionId: q.questionId,
        questionIndex: index,
        timeSpent: 0,
        attempts: 0,
        hintUsed: false,
        answerChangeCount: 0,
        firstAttemptTime: 0,
        finalAttemptTime: 0,
        isCorrect: false,
        selectedAnswer: -1,
        correctAnswer: q.correctAnswer
      }))
    });

    await newTest.save();

    // Return test details with questions (without correct answers)
    const questionsForClient = finalQuestions.map(q => ({
      _id: q._id,
      questionId: q.questionId,
      question: q.question,
      options: q.options,
      difficulty: q.difficulty,
      hint: q.hint,
      images: q.images,
      interactiveContent: q.interactiveContent,
      timeLimit: q.timeLimit
    }));

    res.status(201).json({
      testId,
      module,
      totalQuestions: finalQuestions.length,
      timeLimit: newTest.timeLimit,
      questions: questionsForClient
    });

  } catch (error) {
    console.error('टेस्ट बनाने में त्रुटि:', error);
    res.status(500).json({ error: 'टेस्ट बनाने में त्रुटि' });
  }
});

// POST: Submit answer for a question during test
router.post('/submit-answer', async (req, res) => {
  try {
    const { testId, questionId, selectedAnswer, timeSpent, hintUsed, answerChangeCount } = req.body;

    const test = await MATTest.findOne({ testId });
    if (!test) {
      return res.status(404).json({ error: 'टेस्ट नहीं मिला' });
    }

    // Find the question analytics
    const questionAnalytics = test.questionAnalytics.find(q => q.questionId === questionId);
    if (!questionAnalytics) {
      return res.status(404).json({ error: 'प्रश्न नहीं मिला' });
    }

    // Update analytics
    questionAnalytics.selectedAnswer = selectedAnswer;
    questionAnalytics.timeSpent = timeSpent;
    questionAnalytics.hintUsed = hintUsed;
    questionAnalytics.answerChangeCount = answerChangeCount || 0;
    questionAnalytics.attempts += 1;
    questionAnalytics.finalAttemptTime = Date.now();
    
    if (questionAnalytics.firstAttemptTime === 0) {
      questionAnalytics.firstAttemptTime = Date.now();
    }

    // Check if answer is correct
    questionAnalytics.isCorrect = (selectedAnswer === questionAnalytics.correctAnswer);

    await test.save();

    res.json({ 
      success: true,
      isCorrect: questionAnalytics.isCorrect
    });

  } catch (error) {
    console.error('उत्तर जमा करने में त्रुटि:', error);
    res.status(500).json({ error: 'उत्तर जमा करने में त्रुटि' });
  }
});

// POST: Complete the test and calculate results
router.post('/complete-test', async (req, res) => {
  try {
    const { testId } = req.body;

    const test = await MATTest.findOne({ testId });
    if (!test) {
      return res.status(404).json({ error: 'टेस्ट नहीं मिला' });
    }

    // Calculate results
    test.endTime = new Date();
    test.totalTimeTaken = Math.floor((test.endTime - test.startTime) / 1000); // seconds
    test.completed = true;

    // Count correct, incorrect, unattempted
    test.correctAnswers = test.questionAnalytics.filter(q => q.isCorrect).length;
    test.incorrectAnswers = test.questionAnalytics.filter(q => q.selectedAnswer !== -1 && !q.isCorrect).length;
    test.unattempted = test.questionAnalytics.filter(q => q.selectedAnswer === -1).length;
    test.score = test.correctAnswers;

    // Calculate difficulty breakdown
    const questions = await MATQuestion.find({
      questionId: { $in: test.questionAnalytics.map(q => q.questionId) }
    });

    ['easy', 'medium', 'hard'].forEach(difficulty => {
      const difficultyQuestions = questions.filter(q => q.difficulty.toLowerCase() === difficulty);
      const difficultyIds = difficultyQuestions.map(q => q.questionId);
      const relevantAnalytics = test.questionAnalytics.filter(q => difficultyIds.includes(q.questionId));
      
      test.difficultyBreakdown[difficulty].attempted = relevantAnalytics.filter(q => q.selectedAnswer !== -1).length;
      test.difficultyBreakdown[difficulty].correct = relevantAnalytics.filter(q => q.isCorrect).length;
      if (test.difficultyBreakdown[difficulty].attempted > 0) {
        test.difficultyBreakdown[difficulty].accuracy = Math.round(
          (test.difficultyBreakdown[difficulty].correct / test.difficultyBreakdown[difficulty].attempted) * 100
        );
      }
    });

    // Calculate speed analytics
    const attemptedQuestions = test.questionAnalytics.filter(q => q.selectedAnswer !== -1);
    if (attemptedQuestions.length > 0) {
      test.speedAnalytics.averageTimePerQuestion = Math.round(
        attemptedQuestions.reduce((sum, q) => sum + q.timeSpent, 0) / attemptedQuestions.length
      );
      
      const times = attemptedQuestions.map(q => q.timeSpent);
      test.speedAnalytics.fastestQuestion = Math.min(...times);
      test.speedAnalytics.slowestQuestion = Math.max(...times);
      
      test.speedAnalytics.questionsAnsweredUnderTime = attemptedQuestions.filter(q => {
        const question = questions.find(ques => ques.questionId === q.questionId);
        return question && q.timeSpent < question.timeLimit;
      }).length;
      
      test.speedAnalytics.questionsAnsweredOverTime = attemptedQuestions.length - test.speedAnalytics.questionsAnsweredUnderTime;
    }

    // Identify strengths and weaknesses
    test.strengthAreas = [];
    test.weaknessAreas = [];
    
    if (test.difficultyBreakdown.easy.accuracy >= 80) {
      test.strengthAreas.push('आसान प्रश्न');
    } else if (test.difficultyBreakdown.easy.accuracy < 60) {
      test.weaknessAreas.push('आसान प्रश्न - मूल अवधारणाओं की समीक्षा करें');
    }
    
    if (test.difficultyBreakdown.medium.accuracy >= 70) {
      test.strengthAreas.push('मध्यम प्रश्न');
    } else if (test.difficultyBreakdown.medium.accuracy < 50) {
      test.weaknessAreas.push('मध्यम प्रश्न - अधिक अभ्यास की आवश्यकता');
    }
    
    if (test.difficultyBreakdown.hard.accuracy >= 60) {
      test.strengthAreas.push('कठिन प्रश्न');
    } else if (test.difficultyBreakdown.hard.attempted > 0) {
      test.weaknessAreas.push('कठिन प्रश्न - उन्नत तकनीकों का अभ्यास करें');
    }

    // Calculate learning behavior
    test.calculateLearningBehavior();
    
    // Generate recommendations
    test.generateRecommendations();

    await test.save();

    res.json({
      success: true,
      testId: test.testId,
      redirectUrl: `/student/mat-test-results/${test.testId}`
    });

  } catch (error) {
    console.error('टेस्ट पूर्ण करने में त्रुटि:', error);
    res.status(500).json({ error: 'टेस्ट पूर्ण करने में त्रुटि' });
  }
});

// GET: Get test results with full analytics
router.get('/results/:testId', async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await MATTest.findOne({ testId });
    if (!test) {
      return res.status(404).json({ error: 'टेस्ट परिणाम नहीं मिले' });
    }

    // Get full question details for display
    const questionIds = test.questionAnalytics.map(q => q.questionId);
    const questions = await MATQuestion.find({ questionId: { $in: questionIds } });

    // Map questions with analytics
    const detailedResults = test.questionAnalytics.map(analytics => {
      const question = questions.find(q => q.questionId === analytics.questionId);
      return {
        ...analytics.toObject(),
        question: question ? {
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          difficulty: question.difficulty
        } : null
      };
    });

    res.json({
      testId: test.testId,
      module: test.module,
      startTime: test.startTime,
      endTime: test.endTime,
      totalTimeTaken: test.totalTimeTaken,
      totalQuestions: test.totalQuestions,
      score: test.score,
      correctAnswers: test.correctAnswers,
      incorrectAnswers: test.incorrectAnswers,
      unattempted: test.unattempted,
      percentage: test.percentage,
      difficultyBreakdown: test.difficultyBreakdown,
      speedAnalytics: test.speedAnalytics,
      learningBehavior: test.learningBehavior,
      strengthAreas: test.strengthAreas,
      weaknessAreas: test.weaknessAreas,
      recommendations: test.recommendations,
      detailedResults
    });

  } catch (error) {
    console.error('परिणाम प्राप्त करने में त्रुटि:', error);
    res.status(500).json({ error: 'परिणाम प्राप्त करने में त्रुटि' });
  }
});

// GET: Get all tests for a student in a module
router.get('/student/:studentId/module/:module', async (req, res) => {
  try {
    const { studentId, module } = req.params;

    const tests = await MATTest.find({ 
      studentId, 
      module,
      completed: true 
    })
    .sort({ createdAt: -1 })
    .select('-questionAnalytics') // Exclude detailed analytics for list view
    .lean();

    res.json(tests);

  } catch (error) {
    console.error('टेस्ट सूची प्राप्त करने में त्रुटि:', error);
    res.status(500).json({ error: 'टेस्ट सूची प्राप्त करने में त्रुटि' });
  }
});

// GET: Get student's overall MAT performance across all modules
router.get('/student/:studentId/overview', async (req, res) => {
  try {
    const { studentId } = req.params;

    const tests = await MATTest.find({ 
      studentId,
      completed: true 
    })
    .sort({ createdAt: -1 })
    .lean();

    // Calculate module-wise statistics
    const moduleStats = {};
    tests.forEach(test => {
      if (!moduleStats[test.module]) {
        moduleStats[test.module] = {
          testsAttempted: 0,
          totalQuestions: 0,
          correctAnswers: 0,
          averagePercentage: 0,
          bestScore: 0,
          lastAttempt: null
        };
      }
      
      const stats = moduleStats[test.module];
      stats.testsAttempted += 1;
      stats.totalQuestions += test.totalQuestions;
      stats.correctAnswers += test.correctAnswers;
      stats.bestScore = Math.max(stats.bestScore, test.percentage);
      if (!stats.lastAttempt || new Date(test.createdAt) > new Date(stats.lastAttempt)) {
        stats.lastAttempt = test.createdAt;
      }
    });

    // Calculate averages
    Object.keys(moduleStats).forEach(module => {
      const stats = moduleStats[module];
      stats.averagePercentage = Math.round((stats.correctAnswers / stats.totalQuestions) * 100);
    });

    // Overall statistics
    const totalTests = tests.length;
    const totalQuestions = tests.reduce((sum, test) => sum + test.totalQuestions, 0);
    const totalCorrect = tests.reduce((sum, test) => sum + test.correctAnswers, 0);
    const overallPercentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const averageLearningScore = tests.length > 0 
      ? Math.round(tests.reduce((sum, test) => sum + (test.learningBehavior?.overallLearningScore || 0), 0) / tests.length)
      : 0;

    res.json({
      totalTests,
      totalQuestions,
      totalCorrect,
      overallPercentage,
      averageLearningScore,
      moduleStats,
      recentTests: tests.slice(0, 5) // Last 5 tests
    });

  } catch (error) {
    console.error('सिंहावलोकन प्राप्त करने में त्रुटि:', error);
    res.status(500).json({ error: 'सिंहावलोकन प्राप्त करने में त्रुटि' });
  }
});

// Utility function to shuffle array
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

module.exports = router;
