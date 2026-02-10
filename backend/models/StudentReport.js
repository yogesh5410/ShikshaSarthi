const mongoose = require("mongoose");

const studentReportSchema = new mongoose.Schema({
  quizId: { type: String, required: true },
  studentId: { type: String, required: true },
  correct: { type: Number, required: true },
  incorrect: { type: Number, required: true },
  unattempted: { type: Number, required: true },
  answers: [
    {
      questionId: { type: String },
      selectedAnswer: String,
      isCorrect: Boolean,
    },
  ],
});

module.exports = mongoose.model("StudentReport", studentReportSchema);
