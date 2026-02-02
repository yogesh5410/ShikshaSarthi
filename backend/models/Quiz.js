const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  quizId:{type:String,unique:true},
  teacherId: { type: String, ref: "Teacher" },
  questions: [{ type: String, ref: "Question" }],
  attemptedBy: [{ type: String, ref: "Student" }],
  correct: Number,
  incorrect: Number,
  unattempted: Number,
});

module.exports = mongoose.model("Quiz", quizSchema);
