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
  username: { type: String }, // Make optional, will default to teacherId
  name: { type: String, required: true },
  phone: String,
  schoolId: { type: String, ref: "School", required: true },
  password: { type: String, required: true },
  classes: [{ type: String, ref: "Class" }], // Classes assigned to teacher
  quizzesCreated: [{ type: String, ref: "Quiz" }],
  questionAdded: [embeddedQuestionSchema], // ✅ Embed questions directly
  createdAt: { type: Date, default: Date.now }
});

// Pre-save hook to set username to teacherId if not provided
teacherSchema.pre('save', function(next) {
  if (!this.username) {
    this.username = this.teacherId;
  }
  next();
});

module.exports = mongoose.model("Teacher", teacherSchema);
