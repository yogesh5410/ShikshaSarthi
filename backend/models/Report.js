
import mongoose from "mongoose";

const questionReportSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
  correctCount: { type: Number, default: 0 },
  incorrectCount: { type: Number, default: 0 },
  unattemptedCount: { type: Number, default: 0 }
});

const studentReportSchema = new mongoose.Schema({
  quizId: { type: String, required: true },
  studentId: { type: String, required: true },
  correct: { type: Number, required: true },
  incorrect: { type: Number, required: true },
  unattempted: { type: Number, required: true },
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
      selectedAnswer: String,
      isCorrect: Boolean,
    }
  ]
});

const quizReportSchema = new mongoose.Schema({
  quizId: { type: String, required: true, unique: true },
  questionStats: [questionReportSchema],
});

export const StudentReport = mongoose.model("StudentReport", studentReportSchema);
export const QuizReport = mongoose.model("QuizReport", quizReportSchema);
