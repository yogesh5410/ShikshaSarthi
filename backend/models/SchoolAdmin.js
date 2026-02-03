const mongoose = require("mongoose");

const schoolAdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  schoolId: { type: String, ref: "School", required: true },
  teachers: [{ type: String, ref: "Teacher" }],
  students: [{ type: String, ref: "Student" }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SchoolAdmin", schoolAdminSchema);
