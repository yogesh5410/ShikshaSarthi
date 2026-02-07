const express = require("express");
const router = express.Router();

/**
 * Heuristic-based Cognitive Evaluation
 * All metrics clamped to [0, 1] range.
 * Score output: 0-100.
 */

// Utility: clamp value between 0 and 1
const clamp01 = (v) => Math.min(1, Math.max(0, v));

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

    const MAX_TIME = 180; // seconds (3 minutes)

    /* ---- Guard: if no real gameplay happened ---- */
    const moves = Math.floor(totalClicks / 2); // approximate move count
    const noGameplay = correctPairs === 0 && moves <= 1;

    if (noGameplay) {
      // Player exited or timed out with almost no interaction
      return res.status(200).json({
        score: 0,
        memoryLevel: "Not Evaluated",
        feedback: "कोई वास्तविक गेमप्ले नहीं हुआ। कृपया खेल पूरा करने का प्रयास करें।",
        endReason,
        breakdown: {
          accuracy: 0,
          efficiency: 0,
          speed: 0,
          control: 0,
          penaltyApplied: 0,
        },
      });
    }

    /* ---------------- Heuristic Features ---------------- */

    // 1. Accuracy: fraction of pairs found
    const accuracy = clamp01(correctPairs / totalPairs);

    // 2. Efficiency: how close total clicks are to the ideal (2 per pair found)
    //    Only count against clicks actually used vs pairs found
    const idealClicks = 2 * correctPairs;
    const extraClicks = Math.max(0, totalClicks - idealClicks);
    const maxExtraClicks = 4 * totalPairs; // normalizer
    const efficiency = clamp01(1 - extraClicks / maxExtraClicks);

    // 3. Speed: time efficiency (faster = better)
    const speed = clamp01(1 - timeTaken / MAX_TIME);

    // 4. Control: error regulation (fewer incorrect clicks = better)
    const effectiveErrors = Math.max(0, incorrectClicks - 0.3 * nearbyClicks);
    const control = clamp01(1 - effectiveErrors / totalPairs);

    /* ---------------- Base Fitness Score ---------------- */
    let fitnessScore =
      0.4 * accuracy +
      0.25 * efficiency +
      0.2 * speed +
      0.15 * control;

    /* ---------------- Termination Penalties ---------------- */
    let penalty = 0;

    if (endReason === "EXITED") {
      // Scale penalty by how little was completed
      const completionRatio = correctPairs / totalPairs;
      penalty = 0.3 * (1 - completionRatio); // max 0.3 if nothing done, 0 if all done
    } else if (endReason === "TIME_UP") {
      penalty = 0.1;
    }

    fitnessScore = clamp01(fitnessScore - penalty);
    fitnessScore = Number(fitnessScore.toFixed(2));

    /* ---------------- Classification ---------------- */
    let memoryLevel, feedback;

    if (fitnessScore >= 0.85) {
      memoryLevel = "Exceptional";
      feedback = "उत्कृष्ट याददाश्त और रणनीतिक सोच।";
    } else if (fitnessScore >= 0.7) {
      memoryLevel = "High";
      feedback = "मजबूत कार्यशील स्मृति और कुशल खोज व्यवहार।";
    } else if (fitnessScore >= 0.55) {
      memoryLevel = "Average";
      feedback = "सामान्य संज्ञानात्मक प्रदर्शन, सुधार की गुंजाइश है।";
    } else if (fitnessScore >= 0.4) {
      memoryLevel = "Below Average";
      feedback = "स्मृति और ध्यान को अभ्यास की आवश्यकता है।";
    } else {
      memoryLevel = "Low";
      feedback = "कमजोर स्मृति पुनर्स्मरण और ध्यान नियंत्रण। अधिक अभ्यास करें।";
    }

    /* ---------------- Response ---------------- */
    res.status(200).json({
      score: Math.round(fitnessScore * 100), // 0-100
      memoryLevel,
      feedback,
      endReason,
      breakdown: {
        accuracy: clamp01(accuracy),
        efficiency: clamp01(efficiency),
        speed: clamp01(speed),
        control: clamp01(control),
        penaltyApplied: penalty,
      },
    });
  } catch (err) {
    console.error("Evaluation Error:", err);
    res.status(500).json({ error: "Evaluation failed" });
  }
});

module.exports = router;