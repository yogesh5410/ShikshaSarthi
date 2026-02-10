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
