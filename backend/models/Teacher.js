const mongoose = require("mongoose");

// Define embedded question schema
const embeddedQuestionSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    class: { type: String, required: true },
    topic: { type: String, required: true },
    question: { type: String, required: true },
    questionImage: { type: String },
    options: { type: [String], required: true },
    correctAnswer: { type: String, required: true },
    hint: {
      text: { type: String },
      image: { type: String },
      video: { type: String },
    },
  },
  { _id: false }
); // disable _id for subdocuments if you prefer

const teacherSchema = new mongoose.Schema({
  teacherId: { type: String, required: true, unique: true },
  name: String,
  phone: String,
  schoolId: { type: String, ref: "School" },
  password: String,
  quizzesCreated: [{ type: String, ref: "Quiz" }],
  questionAdded: [embeddedQuestionSchema], // ✅ Embed questions directly
});

module.exports = mongoose.model("Teacher", teacherSchema);
