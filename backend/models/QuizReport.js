const mongoose = require("mongoose");

const questionReportSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
  correctCount: { type: Number, default: 0 },
  incorrectCount: { type: Number, default: 0 },
  unattemptedCount: { type: Number, default: 0 },
});

const quizReportSchema = new mongoose.Schema({
  quizId: { type: String, required: true, unique: true },
  questionStats: [questionReportSchema],
});

module.exports = mongoose.model("QuizReport", quizReportSchema);
