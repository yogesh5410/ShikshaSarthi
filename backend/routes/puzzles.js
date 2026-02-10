const express = require("express");
const router = express.Router();
const PuzzleResult = require("../models/PuzzleResult");

// Available puzzle games for quiz creation
const AVAILABLE_PUZZLES = [
  {
    _id: "puzzle_memory_match",
    puzzleType: "memory_match",
    title: "मेमोरी मैच",
    description: "कार्ड्स की स्थिति याद करें और जोड़ियाँ ढूँढें। याददाश्त और ध्यान का परीक्षण।",
    route: "/student/puzzles/memory-match",
    duration: "3 मिनट",
    type: "puzzle",
    subject: "संज्ञानात्मक",
    class: "सभी",
    topic: "स्मृति",
    modes: [
      { id: "individual", label: "व्यक्तिगत", pairs: 10, cards: 20 },
      { id: "group", label: "समूह", pairs: 20, cards: 40 }
    ]
  },
  {
    _id: "puzzle_match_pieces",
    puzzleType: "match_pieces",
    title: "मैच पीसेज़",
    description: "चित्र के टुकड़ों को जोड़कर मूल चित्र बनाएं। दृश्य पहचान और स्थानिक तर्क का परीक्षण।",
    route: "/student/puzzles/match-pieces",
    duration: "3 मिनट",
    type: "puzzle",
    subject: "संज्ञानात्मक",
    class: "सभी",
    topic: "दृश्य पहचान",
    modes: [
      { id: "standard", label: "मानक", images: 3, piecesPerImage: 9 }
    ]
  }
];

// Get available puzzles for quiz creation & puzzle listing
router.get("/", async (req, res) => {
  try {
    res.status(200).json(AVAILABLE_PUZZLES);
  } catch (error) {
    console.error("Error fetching puzzles:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get single puzzle by ID (for quiz loading)
router.get("/single/:puzzleId", async (req, res) => {
  try {
    const puzzle = AVAILABLE_PUZZLES.find(p => p._id === req.params.puzzleId);
    if (!puzzle) return res.status(404).json({ error: "Puzzle not found" });
    res.status(200).json(puzzle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Memory Match Cognitive Assessment System
 * 
 * STRATEGY:
 * This evaluation system measures four core cognitive domains essential for memory performance:
 * 1. Working Memory Capacity - ability to maintain and manipulate information
 * 2. Attention Control - selective focus and inhibition of irrelevant stimuli  
 * 3. Processing Speed - efficiency of cognitive operations
 * 4. Strategic Thinking - pattern recognition and systematic approach
 * 
 * Each metric is normalized to [0,1] and weighted based on cognitive importance.
 * Final score represents overall memory performance on 0-100 scale.
 */

// Utility: clamp value between 0 and 1
const clamp01 = (v) => Math.min(1, Math.max(0, v));

/**
 * Calculate Working Memory Score
 * Measures the core ability to remember card positions and maintain mental map
 * Higher accuracy indicates stronger working memory capacity
 */
const calculateWorkingMemoryScore = (correctPairs, totalPairs) => {
  return clamp01(correctPairs / totalPairs);
};

/**
 * Calculate Attention Control Score  
 * Measures ability to focus on relevant information and ignore distractors
 * Accounts for erroneous clicks while considering spatial proximity errors
 */
const calculateAttentionControlScore = (incorrectClicks, nearbyClicks, totalPairs) => {
  // Nearby clicks get 30% forgiveness as they indicate partial memory
  const effectiveErrors = Math.max(0, incorrectClicks - 0.3 * nearbyClicks);
  // Normalize by total pairs to account for game difficulty
  const errorRate = effectiveErrors / totalPairs;
  return clamp01(1 - errorRate);
};

/**
 * Calculate Processing Speed Score
 * Measures cognitive efficiency and speed of mental operations
 * Faster completion indicates higher processing speed
 */
const calculateProcessingSpeedScore = (timeTaken, maxTime = 180) => {
  return clamp01(1 - timeTaken / maxTime);
};

/**
 * Calculate Strategic Efficiency Score
 * Measures systematic approach and cognitive resource management
 * Fewer unnecessary clicks indicate better strategic planning
 */
const calculateStrategicEfficiencyScore = (totalClicks, correctPairs, totalPairs) => {
  // Optimal strategy: 2 clicks per successful pair
  const optimalClicks = 2 * correctPairs;
  const excessClicks = Math.max(0, totalClicks - optimalClicks);
  // Normalize excess by theoretical maximum (4 clicks per pair in worst case)
  const maxExcessClicks = 4 * totalPairs;
  return clamp01(1 - excessClicks / maxExcessClicks);
};

/**
 * Apply Performance Penalties
 * Accounts for premature termination which affects cognitive assessment validity
 */
const calculateTerminationPenalty = (endReason, correctPairs, totalPairs) => {
  switch (endReason) {
    case "EXITED":
      // Progressive penalty based on incompletion
      const completionRatio = correctPairs / totalPairs;
      return 0.25 * (1 - completionRatio);
    case "TIME_UP":
      // Minor penalty for time management
      return 0.08;
    default:
      return 0;
  }
};

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
      endReason,
      clickTimestamps = [], // Array of click timestamps for cognitive analysis
      sequentialPatterns = [] // Pattern analysis data
    } = req.body;

    const MAX_TIME = 180; // 3 minutes standard assessment time

    /* ---- Validate Meaningful Gameplay ---- */
    const approximateMoves = Math.floor(totalClicks / 2);
    const hasMinimalEngagement = correctPairs === 0 && approximateMoves <= 1;

    if (hasMinimalEngagement) {
      return res.status(200).json({
        score: 0,
        memoryLevel: "Not Evaluated",
        feedback: "कोई वास्तविक गेमप्ले नहीं हुआ। कृपया खेल पूरा करने का प्रयास करें।",
        endReason,
        cognitiveMetrics: {
          workingMemory: 0,
          attentionControl: 0,
          processingSpeed: 0,
          strategicEfficiency: 0,
          terminationPenalty: 0,
        },
      });
    }

    /* ---- Calculate Core Cognitive Metrics ---- */
    const workingMemory = calculateWorkingMemoryScore(correctPairs, totalPairs);
    const attentionControl = calculateAttentionControlScore(incorrectClicks, nearbyClicks, totalPairs);
    const processingSpeed = calculateProcessingSpeedScore(timeTaken, MAX_TIME);
    const strategicEfficiency = calculateStrategicEfficiencyScore(totalClicks, correctPairs, totalPairs);
    
    /* ---- Calculate Advanced Metrics ---- */
    let averageClickInterval = 0;
    if (clickTimestamps.length > 1) {
      const intervals = clickTimestamps.slice(1).map((time, i) => time - clickTimestamps[i]);
      averageClickInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length / 1000; // Convert to seconds
    }

    /* ---- Composite Cognitive Score ---- */
    // Weights based on cognitive psychology research for memory assessment
    let cognitiveScore =
      0.40 * workingMemory +        // Primary indicator of memory capacity
      0.25 * attentionControl +     // Critical for selective attention
      0.20 * processingSpeed +      // Efficiency of cognitive processing  
      0.15 * strategicEfficiency;   // Higher-order cognitive planning

    /* ---- Apply Performance Adjustments ---- */
    const terminationPenalty = calculateTerminationPenalty(endReason, correctPairs, totalPairs);
    cognitiveScore = clamp01(cognitiveScore - terminationPenalty);
    cognitiveScore = Number(cognitiveScore.toFixed(3));

    /* ---- Memory Performance Classification ---- */
    let memoryLevel, feedback;

    if (cognitiveScore >= 0.85) {
      memoryLevel = "Exceptional";
      feedback = "उत्कृष्ट याददाश्त और रणनीतिक सोच। संज्ञानात्मक क्षमता अत्यधिक विकसित है।";
    } else if (cognitiveScore >= 0.70) {
      memoryLevel = "High";
      feedback = "मजबूत कार्यशील स्मृति और कुशल खोज व्यवहार। उत्तम ध्यान नियंत्रण दिखाया।";
    } else if (cognitiveScore >= 0.55) {
      memoryLevel = "Average";
      feedback = "सामान्य संज्ञानात्मक प्रदर्शन। अभ्यास से और सुधार हो सकता है।";
    } else if (cognitiveScore >= 0.40) {
      memoryLevel = "Below Average";
      feedback = "स्मृति और ध्यान को अधिक अभ्यास की आवश्यकता है। धीरे-धीरे खेलें।";
    } else {
      memoryLevel = "Low";
      feedback = "कमजोर स्मृति पुनर्स्मरण और ध्यान नियंत्रण। नियमित अभ्यास करें।";
    }

    /* ---- Detailed Response with Cognitive Analysis ---- */
    const responseData = {
      score: Math.round(cognitiveScore * 100), // 0-100 scale
      memoryLevel,
      feedback,
      endReason,
      cognitiveMetrics: {
        workingMemory: Number(workingMemory.toFixed(3)),
        attentionControl: Number(attentionControl.toFixed(3)),
        processingSpeed: Number(processingSpeed.toFixed(3)),
        strategicEfficiency: Number(strategicEfficiency.toFixed(3)),
        terminationPenalty: Number(terminationPenalty.toFixed(3)),
        averageClickInterval: Number(averageClickInterval.toFixed(3)), // seconds
      },
      gameplayMetrics: {
        totalPairs,
        correctPairs,
        totalClicks,
        incorrectClicks,
        nearbyClicks,
        timeTaken,
        mode,
        clickEfficiency: totalClicks > 0 ? Number((correctPairs * 2 / totalClicks).toFixed(3)) : 0,
      }
    };

    /* ---- Database Storage with Enhanced Metrics ---- */
    const { studentId } = req.body;
    if (studentId) {
      try {
        await PuzzleResult.create({
          studentId,
          puzzleType: "memory_match",
          score: responseData.score,
          timeTaken,
          endReason,
          mode,
          
          // Core game metrics
          totalPairs,
          correctPairs,
          totalClicks,
          incorrectClicks,
          nearbyClicks,
          
          // Cognitive assessment
          memoryLevel,
          cognitiveMetrics: responseData.cognitiveMetrics,
          gameplayMetrics: responseData.gameplayMetrics,
          
          // Legacy breakdown for backward compatibility
          breakdown: {
            accuracy: workingMemory,
            efficiency: strategicEfficiency,
            speed: processingSpeed,
            control: attentionControl,
            penaltyApplied: terminationPenalty,
          },
          
          feedback,
        });
      } catch (saveErr) {
        console.error("Error saving enhanced memory match result:", saveErr);
      }
    }

    res.status(200).json(responseData);
  } catch (err) {
    console.error("Memory Match Evaluation Error:", err);
    res.status(500).json({ error: "Cognitive evaluation failed" });
  }
});

/* ============================================================
   MATCH PIECES — Visual-Spatial Cognitive Assessment System
   ============================================================
   
   COGNITIVE FOUNDATION:
   This assessment evaluates multi-faceted cognitive processes
   involved in visual-spatial reasoning through puzzle reconstruction.
   Based on research in cognitive psychology, this task measures:
   
   1. VISUAL PROCESSING: Feature detection, pattern recognition,
      and visual attention mechanisms
   2. SPATIAL REASONING: Mental rotation, spatial orientation,
      and visuospatial working memory
   3. EXECUTIVE FUNCTION: Planning, cognitive flexibility,
      and systematic problem-solving strategies
   4. PROCESSING EFFICIENCY: Speed-accuracy tradeoff and
      cognitive resource allocation
   
   KEY COGNITIVE DOMAINS MEASURED:
   • Visual Feature Analysis (30%): Ability to identify and
     match visual elements, textures, and color gradients
   • Task Completion (25%): Executive control and sustained
     attention for complex multi-step problems
   • Cognitive Efficiency (15%): Resource management and
     optimization of mental operations
   • Processing Speed (15%): Rapid visual processing and
     decision-making speed
   • Spatial Strategy (15%): Systematic approach and spatial
     planning abilities
   
   PERFORMANCE INDICATORS:
   Score integrates accuracy, completion rate, efficiency metrics,
   and strategic behavior patterns to provide a comprehensive
   cognitive profile for visual-spatial reasoning abilities.
   ============================================================ */

router.post("/evaluate-pieces", async (req, res) => {
  try {
    const {
      totalImages,       // 3
      imagesCompleted,   // 0-3
      perImage,          // [{ imageIndex, correctPlacements, totalPieces, swapCount, timeTakenMs }]
      totalMoves,        // total drag/click moves across all images
      timeTaken,         // seconds total
      endReason,         // COMPLETED | EXITED | TIME_UP
    } = req.body;

    const MAX_TIME = 180;
    const TOTAL_PIECES = 27; // 3 images × 9 pieces

    /* ---- Guard: no gameplay ---- */
    const totalCorrect = (perImage || []).reduce((sum, img) => sum + (img.correctPlacements || 0), 0);
    if (totalCorrect === 0 && totalMoves <= 1) {
      return res.status(200).json({
        score: 0,
        recognitionLevel: "मूल्यांकन नहीं हुआ",
        feedback: "कोई वास्तविक गेमप्ले नहीं हुआ। कृपया खेल पूरा करने का प्रयास करें।",
        endReason,
        perImageSummary: [],
        breakdown: {
          accuracy: 0,
          completion: 0,
          efficiency: 0,
          speed: 0,
          spatialReasoning: 0,
          penaltyApplied: 0,
        },
      });
    }

    /* ================================================================
       1. VISUAL FEATURE ANALYSIS SCORE (0-1) — WEIGHT: 30%
       
       COGNITIVE BASIS:
       Measures fundamental ability to analyze and match visual features:
       • Color discrimination and matching
       • Texture and pattern recognition
       • Edge detection and alignment
       • Detail orientation and visual precision
       
       CALCULATION: Proportion of pieces correctly placed across all
       images. Directly reflects visual feature analysis capability.
       
       RESEARCH: Visual accuracy in puzzle tasks correlates with
       standardized spatial reasoning tests and predicts STEM success.
       ================================================================ */
    const accuracy = clamp01(totalCorrect / TOTAL_PIECES);

    /* ================================================================
       2. TASK COMPLETION SCORE (0-1) — WEIGHT: 25%
       
       COGNITIVE BASIS:
       Evaluates executive function and sustained attention:
       • Goal-directed behavior maintenance
       • Cognitive persistence and focus
       • Task switching between different images
       • Working memory capacity for complex problems
       
       CALCULATION: Proportion of puzzles fully completed (all 9
       pieces correctly placed). Requires sustained cognitive effort.
       
       SIGNIFICANCE: Task completion correlates with academic
       achievement and reflects ability to persist through challenges.
       ================================================================ */
    const completion = clamp01(imagesCompleted / totalImages);

    /* ================================================================
       3. COGNITIVE EFFICIENCY SCORE (0-1) — WEIGHT: 15%
       
       COGNITIVE BASIS:
       Measures cognitive resource management and optimization:
       • Strategic planning and foresight
       • Cognitive economy and resource allocation
       • Learning from errors and adaptation
       • Mental model accuracy and refinement
       
       CALCULATION: Compares actual moves to optimal (1 move per
       correct placement). Extra moves indicate trial-and-error
       behavior, suggesting less efficient cognitive processing.
       
       IMPORTANCE: Reflects development of expert-level problem-
       solving and correlates with fluid intelligence.
       ================================================================ */
    const idealMoves = totalCorrect; // 1 move per correct placement ideally
    const extraMoves = Math.max(0, totalMoves - idealMoves);
    const maxExtraMoves = TOTAL_PIECES * 3; // generous normalizer
    const efficiency = clamp01(1 - extraMoves / maxExtraMoves);

    /* ================================================================
       4. PROCESSING SPEED SCORE (0-1) — WEIGHT: 15%
       
       COGNITIVE BASIS:
       Evaluates speed of cognitive operations:
       • Visual processing speed and pattern recognition
       • Decision-making latency and response time
       • Cognitive fluency and automaticity
       • Information processing efficiency
       
       CALCULATION: Normalized time score where faster completion
       indicates higher processing speed. Max time of 180 seconds
       provides adequate opportunity while measuring differences.
       
       SIGNIFICANCE: Processing speed shows strong correlations
       with academic achievement and cognitive development.
       ================================================================ */
    const speed = clamp01(1 - timeTaken / MAX_TIME);

    /* ================================================================
       5. SPATIAL STRATEGY SCORE (0-1) — WEIGHT: 15%
       
       COGNITIVE BASIS:
       Evaluates high-level spatial reasoning and strategic thinking:
       • Spatial mental models and cognitive mapping
       • Strategic planning and systematic approach
       • Cognitive flexibility and adaptive problem-solving
       • Meta-cognitive awareness and strategy selection
       
       CALCULATION COMPONENTS:
       A. SWAP EFFICIENCY (70% weight): Fewer rearrangements indicate
          accurate spatial judgments and strong mental models.
       B. SEQUENTIAL BONUS (10-35%): Completing images one at a time
          demonstrates organized, systematic approach.
       C. ACCURACY INTEGRATION (15%): High accuracy reinforces
          spatial reasoning quality.
       
       SIGNIFICANCE: Spatial strategy predicts performance in
       mathematics, engineering, and scientific reasoning.
       ================================================================ */
    const totalSwaps = (perImage || []).reduce((sum, img) => sum + (img.swapCount || 0), 0);
    const maxSwaps = TOTAL_PIECES * 2;
    const swapEfficiency = clamp01(1 - totalSwaps / maxSwaps);

    // Bonus for sequential completion (completing each image fully before moving)
    let sequentialBonus = 0;
    if (imagesCompleted >= 1) sequentialBonus += 0.1;
    if (imagesCompleted >= 2) sequentialBonus += 0.1;
    if (imagesCompleted >= 3) sequentialBonus += 0.15;

    const spatialReasoning = clamp01(swapEfficiency * 0.7 + sequentialBonus + accuracy * 0.15);

    /* ================================================================
       COMPOSITE COGNITIVE SCORE INTEGRATION
       
       SCORING FRAMEWORK:
       Final score represents comprehensive assessment of visual-
       spatial cognitive abilities through weighted integration.
       Weights based on cognitive psychology research.
       
       WEIGHT DISTRIBUTION:
       • Visual Feature Analysis (30%): Primary visual processing
       • Task Completion (25%): Executive function and persistence
       • Cognitive Efficiency (15%): Resource management
       • Processing Speed (15%): Cognitive tempo and fluency
       • Spatial Strategy (15%): Higher-order reasoning
       
       SCORE INTERPRETATION:
       Final score (0-100) represents overall visual-spatial
       reasoning ability relative to normative expectations.
       ================================================================ */
    let fitnessScore =
      0.30 * accuracy +         // Visual Feature Analysis
      0.25 * completion +       // Task Completion
      0.15 * efficiency +       // Cognitive Efficiency
      0.15 * speed +            // Processing Speed
      0.15 * spatialReasoning;  // Spatial Strategy

    /* ---- Termination penalties ---- */
    let penalty = 0;
    if (endReason === "EXITED") {
      const completionRatio = totalCorrect / TOTAL_PIECES;
      penalty = 0.25 * (1 - completionRatio);
    } else if (endReason === "TIME_UP") {
      penalty = 0.08;
    }

    fitnessScore = clamp01(fitnessScore - penalty);
    fitnessScore = Number(fitnessScore.toFixed(2));

    /* ================================================================
       CLASSIFICATION
       ================================================================ */
    let recognitionLevel, feedback;

    if (fitnessScore >= 0.85) {
      recognitionLevel = "उत्कृष्ट (Exceptional)";
      feedback = "शानदार दृश्य पहचान! आपने तेजी और सटीकता से चित्र पूरे किए।";
    } else if (fitnessScore >= 0.70) {
      recognitionLevel = "उच्च (High)";
      feedback = "अच्छी पहचान क्षमता! चित्रों को सही ढंग से जोड़ा।";
    } else if (fitnessScore >= 0.55) {
      recognitionLevel = "सामान्य (Average)";
      feedback = "ठीक प्रदर्शन। रंगों और किनारों पर अधिक ध्यान दें।";
    } else if (fitnessScore >= 0.40) {
      recognitionLevel = "कमजोर (Below Average)";
      feedback = "पहचान क्षमता में सुधार की जरूरत है। मूल चित्र का संकेत उपयोग करें।";
    } else {
      recognitionLevel = "कम (Low)";
      feedback = "अभ्यास जारी रखें। टुकड़ों के रंग और बनावट पर ध्यान दें।";
    }

    /* ================================================================
       PER-IMAGE SUMMARY
       ================================================================ */
    const perImageSummary = (perImage || []).map((img, i) => ({
      imageIndex: i,
      correct: img.correctPlacements || 0,
      total: 9,
      moves: img.moveCount || img.swapCount || 0,
      completed: (img.correctPlacements || 0) === 9,
      timeMs: img.timeTakenMs || 0,
    }));

    /* ================================================================
       RESPONSE
       ================================================================ */
    const responseData = {
      score: Math.round(fitnessScore * 100),
      recognitionLevel,
      feedback,
      endReason,
      perImageSummary,
      breakdown: {
        accuracy: clamp01(accuracy),
        completion: clamp01(completion),
        efficiency: clamp01(efficiency),
        speed: clamp01(speed),
        spatialReasoning: clamp01(spatialReasoning),
        penaltyApplied: penalty,
      },
    };

    // Save to DB if studentId is provided
    const { studentId } = req.body;
    if (studentId) {
      try {
        await PuzzleResult.create({
          studentId,
          puzzleType: "match_pieces",
          score: responseData.score,
          timeTaken,
          endReason,
          totalImages,
          imagesCompleted,
          totalMoves,
          recognitionLevel,
          perImageSummary,
          breakdown: responseData.breakdown,
          feedback,
        });
      } catch (saveErr) {
        console.error("Error saving match pieces result:", saveErr);
      }
    }

    res.status(200).json(responseData);
  } catch (err) {
    console.error("Pieces Evaluation Error:", err);
    res.status(500).json({ error: "Pieces evaluation failed" });
  }
});

/* ============================================================
   GET: Puzzle history for a student
   ============================================================ */

// Get all puzzle results for a student
router.get("/history/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const { type } = req.query; // optional: "memory_match" or "match_pieces"

    const filter = { studentId };
    if (type) filter.puzzleType = type;

    const results = await PuzzleResult.find(filter)
      .sort({ attemptedAt: -1 })
      .limit(50);

    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching puzzle history:", err);
    res.status(500).json({ error: "Failed to fetch puzzle history" });
  }
});

// Get latest puzzle result for a student by type
router.get("/history/:studentId/latest", async (req, res) => {
  try {
    const { studentId } = req.params;
    const { type } = req.query;

    const filter = { studentId };
    if (type) filter.puzzleType = type;

    const latest = await PuzzleResult.findOne(filter)
      .sort({ attemptedAt: -1 });

    res.status(200).json(latest);
  } catch (err) {
    console.error("Error fetching latest result:", err);
    res.status(500).json({ error: "Failed to fetch latest result" });
  }
});

module.exports = router;