const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  username: { type: String }, // Make optional, will default to studentId
  name: { type: String, required: true },
  phone: String,
  schoolId: { type: String, ref: "School", required: true },
  password: { type: String, required: true },
  class: { type: String, required: true },
  classes: [{ type: String, ref: "Class" }], // Classes enrolled in
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
  ],
  createdAt: { type: Date, default: Date.now }
});

// Pre-save hook to set username to studentId if not provided
studentSchema.pre('save', function(next) {
  if (!this.username) {
    this.username = this.studentId;
  }
  next();
});

module.exports = mongoose.model("Student", studentSchema);
