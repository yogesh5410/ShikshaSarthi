const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
});

const vocabularySchema = new mongoose.Schema({
  chapter: { type: String, required: true, trim: true },
  passage: { type: String, required: true },
  questions: [questionSchema],
  createdAt: { type: Date, default: Date.now },
});

const Vocabulary = mongoose.model("VocabularyChapter", vocabularySchema);
module.exports = Vocabulary;
