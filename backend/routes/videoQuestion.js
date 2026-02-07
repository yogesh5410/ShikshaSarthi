const express = require("express");
const router = express.Router();
const VideoQuestion = require("../models/VideoQuestion");

// Get all unique topics for a class and subject (video questions)
router.get("/topics/:class/:subject", async (req, res) => {
  try {
    const { class: className, subject } = req.params;
    
    console.log("📥 Topics request received:");
    console.log("   Class:", className);
    console.log("   Subject:", subject);
    console.log("   Query:", { class: className, subject: subject });
    
    const topics = await VideoQuestion.distinct("topic", {
      class: className,
      subject: subject,
    });
    
    console.log("   Topics found:", topics);
    
    res.status(200).json({ class: className, subject, topics });
  } catch (err) {
    console.error("Error fetching video topics:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get video questions for a specific class, subject, and topic
router.get("/:class/:subject/:topic", async (req, res) => {
  try {
    const { class: className, subject, topic } = req.params;
    const videoQuestions = await VideoQuestion.find({
      class: className,
      subject,
      topic,
    });
    res.status(200).json(videoQuestions);
  } catch (err) {
    console.error("Error fetching video questions:", err);
    res.status(500).json({ error: err.message });
  }
});

// Create a new video question (for admin/teacher)
router.post("/", async (req, res) => {
  try {
    const newVideoQuestion = new VideoQuestion(req.body);
    await newVideoQuestion.save();
    res.status(201).json(newVideoQuestion);
  } catch (err) {
    console.error("Error creating video question:", err);
    res.status(400).json({ error: err.message });
  }
});

// Get all video questions
router.get("/", async (req, res) => {
  try {
    const videoQuestions = await VideoQuestion.find();
    res.status(200).json(videoQuestions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single video question by ID
router.get("/single/:id", async (req, res) => {
  try {
    const videoQuestion = await VideoQuestion.findById(req.params.id);
    if (!videoQuestion) {
      return res.status(404).json({ message: "Video question not found" });
    }
    res.status(200).json(videoQuestion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update video question
router.put("/:id", async (req, res) => {
  try {
    const updated = await VideoQuestion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Video question not found" });
    }
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete video question
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await VideoQuestion.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Video question not found" });
    }
    res.status(200).json({ message: "Video question deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
