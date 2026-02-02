const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  name: String,
  phone: String,
  schoolId: { type: String, ref: "School" },
  password: String,
  class: String,
  quizAttempted: [
    {
      quizId: { type: String, ref: "Quiz" },
      answers: [
        {
          questionId: { type: String, ref: "Question" },
          selectedAnswer: String,
          isCorrect: Boolean // Optional, helpful for scoring
        }
      ],
      score: {
        correct: Number,
        incorrect: Number,
        unattempted: Number
      },
      attemptedAt: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model("Student", studentSchema);
