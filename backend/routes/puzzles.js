const express = require("express");
const router = express.Router();

/**
 * Heuristic-based Cognitive Evaluation
 * Inspired by Local Search Optimization
 */

router.post("/evaluate", async (req, res) => {
  try {
    const {
      mode,
      totalPairs,
      totalClicks,
      incorrectClicks,
      nearbyClicks,
      correctPairs,
      timeTaken,
      endReason, // COMPLETED | EXITED | TIME_UP
    } = req.body;

    /* ---------------- Time Constraints ---------------- */
    // Updated to match frontend: 180 seconds (3 minutes) for both modes
    const MAX_TIME = 180; // seconds

    /* ---------------- Heuristic Features ---------------- */

    // 1️⃣ Accuracy Heuristic
    const accuracy = correctPairs / totalPairs;

    // 2️⃣ Efficiency Heuristic (Search Cost)
    const expectedClicks = 2 * totalPairs;
    const efficiency = Math.max(
      0,
      1 - (totalClicks - expectedClicks) / (4 * totalPairs)
    );

    // 3️⃣ Speed Heuristic (Time Optimization)
    const speed = Math.max(0, 1 - timeTaken / MAX_TIME);

    // 4️⃣ Control Heuristic (Error Regulation)
    const control = Math.max(
      0,
      1 - (incorrectClicks - 0.5 * nearbyClicks) / totalPairs
    );

    /* ---------------- Base Fitness Score ---------------- */
    let fitnessScore =
      0.4 * accuracy +
      0.25 * efficiency +
      0.2 * speed +
      0.15 * control;

    /* ---------------- Termination Penalties ---------------- */
    let penalty = 0;

    if (endReason === "EXITED") {
      penalty = 0.2;
    } else if (endReason === "TIME_UP") {
      penalty = 0.1;
    }

    fitnessScore = Math.max(0, fitnessScore - penalty);
    fitnessScore = Number(fitnessScore.toFixed(2));

    /* ---------------- Classification ---------------- */
    let memoryLevel = "Low";
    let feedback = "Poor memory recall and attention control.";

    if (fitnessScore >= 0.85) {
      memoryLevel = "Exceptional";
      feedback = "Excellent memory capacity and strategic thinking.";
    } else if (fitnessScore >= 0.7) {
      memoryLevel = "High";
      feedback = "Strong working memory with efficient search behavior.";
    } else if (fitnessScore >= 0.55) {
      memoryLevel = "Average";
      feedback = "Normal cognitive performance with scope for improvement.";
    } else if (fitnessScore >= 0.4) {
      memoryLevel = "Below Average";
      feedback = "Memory and attention need practice.";
    }

    /* ---------------- Response ---------------- */
    res.status(200).json({
      score: Math.round(fitnessScore * 100), // 0–100
      memoryLevel,
      feedback,
      endReason,
      breakdown: {
        accuracy,
        efficiency,
        speed,
        control,
        penaltyApplied: penalty,
      },
    });
  } catch (err) {
    console.error("Evaluation Error:", err);
    res.status(500).json({ error: "Evaluation failed" });
  }
});

module.exports = router;