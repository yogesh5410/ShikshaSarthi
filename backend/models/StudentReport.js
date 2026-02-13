const mongoose = require("mongoose");

const studentReportSchema = new mongoose.Schema({
  quizId: { type: String, required: true },
  studentId: { type: String, required: true },
  correct: { type: Number, required: true },
  incorrect: { type: Number, required: true },
  unattempted: { type: Number, required: true },
  timeTaken: { type: Number }, // Time taken in seconds
  answers: [
    {
      questionId: { type: String },
      questionType: { type: String },
      selectedAnswer: String,
      isCorrect: Boolean,
    },
  ],
}, { timestamps: true }); // Add timestamps to track createdAt and updatedAt

module.exports = mongoose.model("StudentReport", studentReportSchema);
