const mongoose = require('mongoose');

const audioQuizAttemptSchema = new mongoose.Schema({
  studentId: {
    type: String, // Changed to String to store "STU001" format
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  wrongAnswers: {
    type: Number,
    required: true
  },
  skippedQuestions: {
    type: Number,
    default: 0
  },
  timeTaken: {
    type: Number, // in seconds
    required: true
  },
  audioAnalytics: {
    totalListenTime: {
      type: Number,
      default: 0
    },
    averageListenPercentage: {
      type: Number,
      default: 0
    },
    totalReplayCount: {
      type: Number,
      default: 0
    },
    questionsWithReplays: {
      type: Number,
      default: 0
    },
    averageAttentionScore: {
      type: Number,
      default: 0
    }
  },
  questionAnalytics: [{
    questionId: String,
    questionText: String,
    selectedAnswer: String,
    correctAnswer: String,
    isCorrect: Boolean,
    audioPlayCount: Number,
    audioListenTime: Number,
    audioListenPercentage: Number,
    attemptTime: Number, // Time taken to answer in seconds
    isTukka: Boolean, // Quick answer detection
    status: {
      type: String,
      enum: ['attempted', 'skipped', 'not-attempted'],
      default: 'not-attempted'
    }
  }],
  learningMetrics: {
    audioComprehensionScore: Number,
    listeningEngagementScore: Number,
    audioFocusScore: Number,
    processingEfficiency: Number,
    strategicUsage: Number,
    learningPotential: Number
  },
  attemptedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
audioQuizAttemptSchema.index({ studentId: 1, subject: 1, topic: 1, attemptedAt: -1 });

const AudioQuizAttempt = mongoose.model('AudioQuizAttempt', audioQuizAttemptSchema);

module.exports = AudioQuizAttempt;
