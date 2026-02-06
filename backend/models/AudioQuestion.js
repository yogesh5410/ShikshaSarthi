const mongoose = require("mongoose");

const audioQuestionSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  class: { type: String, required: true },
  topic: { type: String, required: true },
  question: { type: String, required: true },

  questionImage: {
    type: String,
    required: false
  },

  options: {
    type: [String],
    required: true
  },

  correctAnswer: {
    type: String,
    required: true
  },

  hint: {
    text: { type: String },
    image: { type: String },
    video: { type: String }
  },

  // Audio field
  audio: {
    type: String,   // Cloudinary mp3 URL
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("AudioQuestion", audioQuestionSchema);
