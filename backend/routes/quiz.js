const express = require("express");
const router = express.Router();
const Quiz = require("../models/Quiz");
const Teacher = require("../models/Teacher"); // adjust the path as needed
const Question = require("../models/Question");


// Create a new quiz
router.post("/", async (req, res) => {
  try {
    const { teacherId } = req.body;

    // Validate teacherId
    const teacher = await Teacher.findOne({ teacherId });
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

module.exports = router;
