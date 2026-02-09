const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Quiz = require("../models/Quiz");
const Teacher = require("../models/Teacher"); // adjust the path as needed
const Question = require("../models/Question");

// Helper: find a teacher by either their custom teacherId or MongoDB _id
async function findTeacherByIdentifier(identifier) {
  if (!identifier) return null;
  if (mongoose.isValidObjectId(identifier)) {
    const byId = await Teacher.findById(identifier);
    if (byId) return byId;
  }
  return await Teacher.findOne({ teacherId: identifier });
}


// Create a new quiz
router.post("/", async (req, res) => {
  try {
    const { teacherId } = req.body;

    // Validate teacherId
    const teacher = await findTeacherByIdentifier(teacherId);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Create and save the quiz
    const quiz = new Quiz(req.body);
    await quiz.save();

    // Add quiz ID to teacher's quizzesCreated array
    teacher.quizzesCreated.push(quiz._id);
    await teacher.save();

    res.status(201).json(quiz);
  } catch (err) {
    console.error("Error creating quiz:", err);
    res.status(400).json({ error: err.message });
  }
});

// Get all quizzes
router.get("/", async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate("questions");
    res.status(200).json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get quiz by ID
router.get("/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ quizId: req.params.id }).populate(
      "questions"
    );
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.status(200).json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Update quiz by ID
router.put("/:id", async (req, res) => {
  try {
    const updated = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Quiz not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update quiz by quizId (custom ID)
router.put("/update/:quizId", async (req, res) => {
  try {
    const updated = await Quiz.findOneAndUpdate(
      { quizId: req.params.quizId },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updated) return res.status(404).json({ message: "Quiz not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete quiz by ID
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Quiz.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Quiz not found" });
    res.status(200).json({ message: "Quiz deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get quizzes created by a specific teacher
router.get("/teacher/:teacherId", async (req, res) => {
  try {
    const quizzes = await Quiz.find({ teacherId: req.params.teacherId }).populate("questions");
    res.status(200).json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get quizzes attempted by a specific student
router.get("/student/:studentId", async (req, res) => {
  try {
    const quizzes = await Quiz.find({ attemptedBy: req.params.studentId }).populate("questions");
    res.status(200).json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:quizId/custom-question", async (req, res) => {
  try {
    const { quizId } = req.params;
    const { question, questionImage, options, correctAnswer, teacherId } = req.body;

    if (!question || !options || !correctAnswer || !teacherId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newQuestion = new Question({
      question,
      questionImage,
      options,
      correctAnswer,
      teacherId,
      class: "custom",
      subject: "custom",
      topic: "custom",
      isCustom: true,
    });

    await newQuestion.save();

    const quiz = await Quiz.findOne({ quizId });
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    quiz.questions.push(newQuestion._id);
    await quiz.save();

    res.status(201).json({ message: "Custom question added", question: newQuestion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Check if quiz ID exists
router.get("/check/:quizId", async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ quizId: req.params.quizId });
    res.status(200).json({ exists: !!quiz });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get quiz by quizId (custom ID, not MongoDB _id)
router.get("/by-id/:quizId", async (req, res) => {
  try {
    // Don't populate questions since they're custom string IDs, not ObjectIds
    const quiz = await Quiz.findOne({ quizId: req.params.quizId });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.status(200).json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Enhanced quiz creation with full configuration
router.post("/create", async (req, res) => {
  try {
    const { teacherId, quizId } = req.body;

    // Validate teacherId
    const teacher = await findTeacherByIdentifier(teacherId);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Check if quizId already exists
    const existingQuiz = await Quiz.findOne({ quizId });
    if (existingQuiz) {
      return res.status(400).json({ error: "Quiz ID already exists" });
    }

    // Create and save the quiz
    const quiz = new Quiz(req.body);
    await quiz.save();

    // Add quiz ID to teacher's quizzesCreated array
    teacher.quizzesCreated.push(quiz._id);
    await teacher.save();

    res.status(201).json(quiz);
  } catch (err) {
    console.error("Error creating quiz:", err);
    res.status(400).json({ error: err.message });
  }
});

// Get detailed analytics for a quiz
router.get("/analytics/:quizId", async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ quizId: req.params.quizId }).populate("questions");
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // attemptedBy stores studentId strings (custom studentId), so populate using localField/foreignField
    await quiz.populate({
      path: 'attemptedBy',
      model: 'Student',
      localField: 'attemptedBy',
      foreignField: 'studentId'
    });

    // Get all student reports for this quiz
    const Report = require("../models/Report");
    const StudentReport = require("../models/StudentReport");
    
    const reports = await StudentReport.find({ quizId: quiz.quizId });
    
    // Calculate statistics
    const analytics = {
      quizInfo: {
        quizId: quiz.quizId,
        totalQuestions: quiz.totalQuestions,
        timeLimit: quiz.timeLimit,
        questionTypes: quiz.questionTypes,
        startTime: quiz.startTime,
        endTime: quiz.endTime
      },
      totalAttempts: reports.length,
      students: reports.map(report => ({
        studentId: report.studentId,
        score: report.score,
        totalQuestions: report.totalQuestions,
        correctAnswers: report.correctAnswers,
        incorrectAnswers: report.incorrectAnswers,
        unattempted: report.unattempted,
        percentage: ((report.correctAnswers / report.totalQuestions) * 100).toFixed(2),
        timeTaken: report.timeTaken,
        submittedAt: report.submittedAt
      })).sort((a, b) => b.score - a.score),
      averageScore: reports.length > 0 
        ? (reports.reduce((sum, r) => sum + r.score, 0) / reports.length).toFixed(2)
        : 0,
      highestScore: reports.length > 0 
        ? Math.max(...reports.map(r => r.score))
        : 0,
      lowestScore: reports.length > 0 
        ? Math.min(...reports.map(r => r.score))
        : 0
    };

    res.status(200).json(analytics);
  } catch (err) {
    console.error("Error fetching analytics:", err);
    res.status(500).json({ error: err.message });
  }
});

// Submit advanced quiz attempt
router.post("/submit-advanced", async (req, res) => {
  try {
    const { quizId, studentId, answers, score, timeTaken, completedAt, timeUp } = req.body;

    // Find the quiz
    const quiz = await Quiz.findOne({ quizId });
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Add student to attemptedBy if not already there
    if (!quiz.attemptedBy.includes(studentId)) {
      quiz.attemptedBy.push(studentId);
      await quiz.save();
    }

    // Create a student report
    const StudentReport = require("../models/StudentReport");
    const Student = require("../models/Student");
    
    const student = await Student.findOne({ studentId });
    
    const report = new StudentReport({
      quizId,
      studentId,
      studentName: student?.name || studentId,
      answers: answers.map((ans) => ({
        questionId: ans.questionId,
        questionType: ans.questionType,
        selectedAnswer: ans.selectedAnswer,
        correctAnswer: ans.correctAnswer,
        isCorrect: ans.isCorrect,
        timeSpent: ans.timeSpent
      })),
      score: score.correct,
      totalQuestions: quiz.totalQuestions,
      correctAnswers: score.correct,
      incorrectAnswers: score.incorrect,
      unattempted: score.unattempted,
      timeTaken,
      submittedAt: completedAt,
      timeUp: timeUp || false
    });

    await report.save();

    res.status(201).json({
      message: "Quiz submitted successfully",
      reportId: report._id,
      score: {
        correct: score.correct,
        incorrect: score.incorrect,
        unattempted: score.unattempted,
        percentage: ((score.correct / quiz.totalQuestions) * 100).toFixed(2)
      }
    });
  } catch (err) {
    console.error("Error submitting quiz:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

