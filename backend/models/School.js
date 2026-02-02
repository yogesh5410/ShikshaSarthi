const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema({
  schoolId: { type: String, required: true, unique: true },
  schoolName: { type: String, required: true },
  location: { type: String, required: true },
});

module.exports = mongoose.model("School", schoolSchema);
