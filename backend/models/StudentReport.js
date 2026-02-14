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
      correctAnswer: String,
      timeSpent: { type: Number, default: 0 }, // Time spent on this question in seconds
      
      // Video question specific data (for displaying in past reports)
      questionText: String,
      options: [String],
      hint: String,
      solution: String,
      parentVideoId: String,
      questionIndex: Number,
      
      // Video analytics data
      videoAnalytics: {
        videoDuration: Number,
        watchTime: Number,
        watchPercentage: Number,
        pauseCount: Number,
        seekCount: Number,
        playbackEvents: [{
          action: String,
          timestamp: Number
        }]
      }
    },
  ],
}, { timestamps: true }); // Add timestamps to track createdAt and updatedAt

module.exports = mongoose.model("StudentReport", studentReportSchema);
