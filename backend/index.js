const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const questionRoutes = require("./routes/question");
const quizRoutes = require("./routes/quiz");
const studentRoutes = require("./routes/student");
const teacherRoutes = require("./routes/teacher");
const reportRoutes = require("./routes/report");
const schoolRoutes = require("./routes/school");
const vocabRoutes = require("./routes/vocabularyRoutes");
const superAdminRoutes = require("./routes/superadmin");
const schoolAdminRoutes = require("./routes/schooladmin");
const classRoutes = require("./routes/class");
const videoQuestionRoutes = require("./routes/videoQuestion");
const puzzlesRoutes = require("./routes/puzzles");
const matRoutes = require("./routes/mat");
const matTestRoutes = require("./routes/matTest");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static video files for offline access
app.use('/videos', express.static('public/videos'));

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

app.use("/questions", questionRoutes);
app.use("/quizzes", quizRoutes);
app.use("/students", studentRoutes);
app.use("/teachers", teacherRoutes);
app.use("/reports", reportRoutes);
app.use("/schools", schoolRoutes);
app.use("/vocab", vocabRoutes);
app.use("/superadmin", superAdminRoutes);
app.use("/schooladmin", schoolAdminRoutes);
app.use("/classes", classRoutes);
app.use("/video-questions", videoQuestionRoutes);
app.use("/puzzles", puzzlesRoutes);
app.use("/mat", matRoutes);
app.use("/mat-test", matTestRoutes);
// https://shiksha-sarthi-nmms-prep-cn64.vercel.app



const PORT = process.env.PORT || 5000;

// Listen on all network interfaces for LAN access
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 LAN Access: http://0.0.0.0:${PORT}`);
});
