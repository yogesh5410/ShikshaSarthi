
import mongoose from "mongoose";

const questionReportSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
  correctCount: { type: Number, default: 0 },
  incorrectCount: { type: Number, default: 0 },
  unattemptedCount: { type: Number, default: 0 }
});

const quizReportSchema = new mongoose.Schema({
  quizId: { type: String, required: true, unique: true },
  questionStats: [questionReportSchema],
});

// Use existing models or create new ones (avoid OverwriteModelError)
export const StudentReport = mongoose.models.StudentReport || mongoose.model("StudentReport", new mongoose.Schema({
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
}));

export const QuizReport = mongoose.models.QuizReport || mongoose.model("QuizReport", quizReportSchema);
