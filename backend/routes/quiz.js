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
    const quizzes = await Quiz.find();
    // Try to populate questions (may fail if mixed ID types like puzzle IDs)
    for (const quiz of quizzes) {
      try {
        await quiz.populate("questions");
      } catch (popErr) {
        console.log(`Question populate skipped for quiz ${quiz.quizId} (mixed ID types)`);
      }
    }
    res.status(200).json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get quiz by ID
router.get("/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ quizId: req.params.id });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // Try to populate questions (may fail if mixed ID types like puzzle IDs)
    try {
      await quiz.populate("questions");
    } catch (popErr) {
      console.log("Question populate skipped (mixed ID types):", popErr.message);
    }

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
    const quizzes = await Quiz.find({ teacherId: req.params.teacherId });
    // Try to populate questions (may fail if mixed ID types like puzzle IDs)
    for (const quiz of quizzes) {
      try {
        await quiz.populate("questions");
      } catch (popErr) {
        console.log(`Question populate skipped for quiz ${quiz.quizId} (mixed ID types)`);
      }
    }
    res.status(200).json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get quizzes attempted by a specific student
router.get("/student/:studentId", async (req, res) => {
  try {
    const quizzes = await Quiz.find({ attemptedBy: req.params.studentId });
    // Try to populate questions (may fail if mixed ID types like puzzle IDs)
    for (const quiz of quizzes) {
      try {
        await quiz.populate("questions");
      } catch (popErr) {
        console.log(`Question populate skipped for quiz ${quiz.quizId} (mixed ID types)`);
      }
    }
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
    const quiz = await Quiz.findOne({ quizId: req.params.quizId });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // Get all student reports for this quiz
    const StudentReport = require("../models/StudentReport");
    
    const reports = await StudentReport.find({ quizId: quiz.quizId });
    
    console.log(`Found ${reports.length} reports for quiz ${quiz.quizId}`);
    
    // Calculate statistics from StudentReport model (which has correct, incorrect, unattempted)
    const studentReports = reports.map(report => {
      const totalQuestions = report.correct + report.incorrect + report.unattempted;
      const percentage = totalQuestions > 0 ? ((report.correct / totalQuestions) * 100) : 0;
      
      // Calculate section-wise scores
      const sectionWise = {
        mcq: { correct: 0, incorrect: 0, unattempted: 0, total: 0, percentage: 0 },
        audio: { correct: 0, incorrect: 0, unattempted: 0, total: 0, percentage: 0 },
        video: { correct: 0, incorrect: 0, unattempted: 0, total: 0, percentage: 0 },
        puzzle: { correct: 0, incorrect: 0, unattempted: 0, total: 0, percentage: 0 }
      };
      
      // Process answers to get section-wise data
      if (report.answers && Array.isArray(report.answers)) {
        report.answers.forEach(answer => {
          const type = answer.questionType;
          if (sectionWise[type]) {
            sectionWise[type].total++;
            if (!answer.selectedAnswer) {
              sectionWise[type].unattempted++;
            } else if (answer.isCorrect) {
              sectionWise[type].correct++;
            } else {
              sectionWise[type].incorrect++;
            }
          }
        });
        
        // Calculate percentages for each section
        Object.keys(sectionWise).forEach(key => {
          const section = sectionWise[key];
          section.percentage = section.total > 0 
            ? ((section.correct / section.total) * 100).toFixed(2)
            : 0;
        });
      }
      
      return {
        studentId: report.studentId,
        correct: report.correct,
        incorrect: report.incorrect,
        unattempted: report.unattempted,
        totalQuestions: totalQuestions,
        percentage: percentage.toFixed(2),
        sectionWise: sectionWise,
        submittedAt: report.createdAt || new Date()
      };
    }).sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));
    
    // Calculate section-wise rankings
    const sectionRankings = {
      mcq: [...studentReports].sort((a, b) => parseFloat(b.sectionWise.mcq.percentage) - parseFloat(a.sectionWise.mcq.percentage)),
      audio: [...studentReports].sort((a, b) => parseFloat(b.sectionWise.audio.percentage) - parseFloat(a.sectionWise.audio.percentage)),
      video: [...studentReports].sort((a, b) => parseFloat(b.sectionWise.video.percentage) - parseFloat(a.sectionWise.video.percentage)),
      puzzle: [...studentReports].sort((a, b) => parseFloat(b.sectionWise.puzzle.percentage) - parseFloat(a.sectionWise.puzzle.percentage))
    };
    
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
      studentReports: studentReports,
      sectionRankings: sectionRankings,
      averageScore: reports.length > 0 
        ? (studentReports.reduce((sum, r) => sum + parseFloat(r.percentage), 0) / reports.length).toFixed(2)
        : 0,
      highestScore: reports.length > 0 
        ? Math.max(...studentReports.map(r => parseFloat(r.percentage)))
        : 0,
      lowestScore: reports.length > 0 
        ? Math.min(...studentReports.map(r => parseFloat(r.percentage)))
        : 0,
      sectionAverages: {
        mcq: reports.length > 0 ? (studentReports.reduce((sum, r) => sum + parseFloat(r.sectionWise.mcq.percentage || 0), 0) / reports.length).toFixed(2) : 0,
        audio: reports.length > 0 ? (studentReports.reduce((sum, r) => sum + parseFloat(r.sectionWise.audio.percentage || 0), 0) / reports.length).toFixed(2) : 0,
        video: reports.length > 0 ? (studentReports.reduce((sum, r) => sum + parseFloat(r.sectionWise.video.percentage || 0), 0) / reports.length).toFixed(2) : 0,
        puzzle: reports.length > 0 ? (studentReports.reduce((sum, r) => sum + parseFloat(r.sectionWise.puzzle.percentage || 0), 0) / reports.length).toFixed(2) : 0
      }
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

    console.log('=== BACKEND SUBMIT DEBUG ===');
    console.log('Received studentId:', studentId);
    console.log('studentId type:', typeof studentId);
    console.log('studentId length:', studentId?.length);
    console.log('===========================');

    // Validate required fields
    if (!quizId) {
      return res.status(400).json({ error: "Quiz ID is required" });
    }

    if (!studentId || studentId.trim() === '') {
      return res.status(400).json({ error: "Student ID is required and cannot be empty" });
    }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Answers array is required" });
    }

    if (!score || typeof score.correct === 'undefined' || typeof score.incorrect === 'undefined') {
      return res.status(400).json({ error: "Score object with correct and incorrect counts is required" });
    }

    // Find the quiz
    const quiz = await Quiz.findOne({ quizId });
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Check if student has already submitted this quiz
    const StudentReport = require("../models/StudentReport");
    const existingSubmission = await StudentReport.findOne({ quizId, studentId: studentId.trim() });
    
    if (existingSubmission) {
      return res.status(400).json({ 
        error: "You have already submitted this quiz", 
        message: "Duplicate submission not allowed",
        existingReport: existingSubmission._id
      });
    }

    // Add student to attemptedBy if not already there
    if (!quiz.attemptedBy.includes(studentId)) {
      quiz.attemptedBy.push(studentId);
      await quiz.save();
    }

    // Create a student report
    const Student = require("../models/Student");
    
    const student = await Student.findOne({ studentId });
    
    if (!student) {
      console.warn(`Student with ID ${studentId} not found in database`);
    }
    
    const report = new StudentReport({
      quizId,
      studentId: studentId.trim(), // Ensure trimmed
      correct: score.correct,
      incorrect: score.incorrect,
      unattempted: score.unattempted,
      answers: answers.map((ans) => ({
        questionId: ans.questionId,
        selectedAnswer: ans.selectedAnswer,
        isCorrect: ans.isCorrect
      }))
    });

    await report.save();

    // Also save puzzle results to PuzzleResult collection for puzzle history tracking
    const PuzzleResult = require("../models/PuzzleResult");
    const puzzleAnswers = answers.filter(ans => ans.questionType === 'puzzle' && ans.puzzleData);
    for (const pAns of puzzleAnswers) {
      try {
        const pd = pAns.puzzleData;
        const puzzleDoc = {
          studentId: studentId.trim(),
          puzzleType: pd.puzzleType,
          score: pd.score || 0,
          timeTaken: pd.timeTaken || 0,
          endReason: pd.endReason || 'COMPLETED',
        };

        // Memory match specific fields
        if (pd.puzzleType === 'memory_match') {
          puzzleDoc.mode = pd.mode || 'individual';
          puzzleDoc.totalPairs = pd.totalPairs;
          puzzleDoc.correctPairs = pd.correctPairs;
          puzzleDoc.totalClicks = pd.totalClicks;
          puzzleDoc.incorrectClicks = pd.incorrectClicks;
          puzzleDoc.nearbyClicks = pd.nearbyClicks;

          // Enhanced cognitive metrics
          if (pd.clickTimestamps && pd.clickTimestamps.length > 1) {
            const intervals = pd.clickTimestamps.slice(1).map((time, i) => time - pd.clickTimestamps[i]);
            const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length / 1000;
            
            puzzleDoc.cognitiveMetrics = {
              workingMemory: Number(((pd.correctPairs || 0) / (pd.totalPairs || 1)).toFixed(3)),
              attentionControl: Number((1 - Math.max(0, (pd.incorrectClicks || 0) - 0.3 * (pd.nearbyClicks || 0)) / (pd.totalPairs || 1)).toFixed(3)),
              processingSpeed: Number((1 - (pd.timeTaken || 0) / 180).toFixed(3)),
              strategicEfficiency: Number((1 - Math.max(0, (pd.totalClicks || 0) - 2 * (pd.correctPairs || 0)) / (4 * (pd.totalPairs || 1))).toFixed(3)),
              terminationPenalty: pd.endReason === 'EXITED' ? 0.25 * (1 - (pd.correctPairs || 0) / (pd.totalPairs || 1)) : (pd.endReason === 'TIME_UP' ? 0.08 : 0),
              averageClickInterval: avgInterval
            };
          }

          // Enhanced gameplay metrics
          puzzleDoc.gameplayMetrics = {
            totalPairs: pd.totalPairs,
            correctPairs: pd.correctPairs,
            totalClicks: pd.totalClicks,
            incorrectClicks: pd.incorrectClicks,
            nearbyClicks: pd.nearbyClicks,
            timeTaken: pd.timeTaken,
            mode: pd.mode,
            clickEfficiency: pd.totalClicks > 0 ? Number((pd.correctPairs * 2 / pd.totalClicks).toFixed(3)) : 0
          };
        }

        // Match pieces specific fields (unchanged for now)
        if (pd.puzzleType === 'match_pieces') {
          puzzleDoc.totalImages = pd.totalImages;
          puzzleDoc.imagesCompleted = pd.imagesCompleted;
          puzzleDoc.totalMoves = pd.totalMoves;
          if (pd.perImage) {
            puzzleDoc.perImageSummary = pd.perImage.map(img => ({
              imageIndex: img.imageIndex,
              correct: img.correctPlacements,
              total: img.totalPieces,
              moves: img.moveCount,
              completed: img.correctPlacements === img.totalPieces,
              timeMs: img.timeTakenMs,
            }));
          }
        }

        await new PuzzleResult(puzzleDoc).save();
        console.log(`Saved enhanced puzzle result for student ${studentId}, type: ${pd.puzzleType}, score: ${pd.score}`);
      } catch (puzzleErr) {
        console.error("Error saving enhanced puzzle result from quiz:", puzzleErr);
        // Don't fail the whole submission for puzzle save errors
      }
    }

    // Update quiz attemptedBy array if not already present
    if (!quiz.attemptedBy.includes(studentId)) {
      quiz.attemptedBy.push(studentId);
      await quiz.save();
    }

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

