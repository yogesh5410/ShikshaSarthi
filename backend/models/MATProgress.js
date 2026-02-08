const mongoose = require('mongoose');

const MATProgressSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    index: true
  },
  
  module: {
    type: String,
    required: true
  },
  
  // Questions attempted in this module
  questionsAttempted: [{
    questionId: String,
    isCorrect: Boolean,
    timeTaken: Number, // in seconds
    attemptedAt: Date,
    hintsUsed: {
      type: Number,
      default: 0
    }
  }],
  
  // Module statistics
  totalQuestions: {
    type: Number,
    default: 0
  },
  
  correctAnswers: {
    type: Number,
    default: 0
  },
  
  incorrectAnswers: {
    type: Number,
    default: 0
  },
  
  averageTimeTaken: {
    type: Number,
    default: 0
  },
  
  // Progress tracking
  moduleCompleted: {
    type: Boolean,
    default: false
  },
  
  completionPercentage: {
    type: Number,
    default: 0
  },
  
  lastAttemptedAt: {
    type: Date,
    default: Date.now
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for faster queries
MATProgressSchema.index({ studentId: 1, module: 1 }, { unique: true });

// Calculate accuracy
MATProgressSchema.virtual('accuracy').get(function() {
  if (this.totalQuestions === 0) return 0;
  return ((this.correctAnswers / this.totalQuestions) * 100).toFixed(2);
});

module.exports = mongoose.model('MATProgress', MATProgressSchema);
