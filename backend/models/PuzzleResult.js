const mongoose = require("mongoose");

const puzzleResultSchema = new mongoose.Schema({
  studentId: { type: String, required: true, index: true },
  puzzleType: {
    type: String,
    required: true,
    enum: ["memory_match", "match_pieces"],
  },

  // Common fields
  score: { type: Number, required: true },           // 0-100
  timeTaken: { type: Number, required: true },        // seconds
  endReason: { type: String, enum: ["COMPLETED", "EXITED", "TIME_UP"], required: true },

  // Memory Match specific
  mode: { type: String, enum: ["individual", "group"] },     // only for memory_match
  totalPairs: Number,
  correctPairs: Number,
  totalClicks: Number,
  incorrectClicks: Number,
  nearbyClicks: Number,
  memoryLevel: String,

  // Enhanced cognitive assessment metrics
  cognitiveMetrics: {
    workingMemory: Number,           // Core memory capacity (0-1)
    attentionControl: Number,        // Focus and inhibition control (0-1)
    processingSpeed: Number,         // Cognitive efficiency (0-1)
    strategicEfficiency: Number,     // Planning and resource management (0-1)
    terminationPenalty: Number,      // Performance adjustment factor (0-1)
    averageClickInterval: Number,    // Time between clicks in seconds
  },

  // Detailed gameplay metrics for analysis
  gameplayMetrics: {
    totalPairs: Number,
    correctPairs: Number,
    totalClicks: Number,
    incorrectClicks: Number,
    nearbyClicks: Number,
    timeTaken: Number,
    mode: String,
    clickEfficiency: Number,         // Ratio of optimal to actual clicks
  },

  // Match Pieces specific
  totalImages: Number,
  imagesCompleted: Number,
  totalMoves: Number,
  recognitionLevel: String,
  perImageSummary: [
    {
      imageIndex: Number,
      correct: Number,
      total: Number,
      moves: Number,
      completed: Boolean,
      timeMs: Number,
    },
  ],

  // Breakdown (both puzzles have these)
  breakdown: {
    accuracy: Number,
    efficiency: Number,
    speed: Number,
    control: Number,
    completion: Number,
    spatialReasoning: Number,
    penaltyApplied: Number,
  },

  feedback: String,
  attemptedAt: { type: Date, default: Date.now },
});

// Compound index for efficient student+type queries
puzzleResultSchema.index({ studentId: 1, puzzleType: 1, attemptedAt: -1 });

module.exports = mongoose.model("PuzzleResult", puzzleResultSchema);
