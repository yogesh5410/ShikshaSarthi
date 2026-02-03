const express = require("express");
const router = express.Router();
const Class = require("../models/Class");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");

// Create a new class
router.post("/", async (req, res) => {
  try {
    const { className, subject, teacherId, schoolId } = req.body;

    // Validate required fields
    if (!className || !subject || !teacherId || !schoolId) {
      return res.status(400).json({ error: "Missing required fields: className, subject, teacherId, schoolId" });
    }

    // Generate unique classId
    const classId = `${schoolId}-${teacherId}-${className}-${subject}-${Date.now()}`;

    const newClass = new Class({
      classId,
      className,
      subject,
      teacherId,
      schoolId
    });

    await newClass.save();

    // Add class to teacher's classes array
    await Teacher.findOneAndUpdate(
      { teacherId: teacherId },
      { $push: { classes: newClass.classId } }
    );

    res.status(201).json(newClass);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all classes for a teacher
router.get("/teacher/:teacherId", async (req, res) => {
  try {
    const classes = await Class.find({ teacherId: req.params.teacherId });
    res.status(200).json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific class with student details
router.get("/:classId", async (req, res) => {
  try {
    const classData = await Class.findOne({ classId: req.params.classId });
    if (!classData) return res.status(404).json({ message: "Class not found" });
    
    // Manually fetch student details
    const studentDetails = await Student.find({ 
      studentId: { $in: classData.students } 
    }).select('studentId name class phone');
    
    res.status(200).json({
      ...classData.toObject(),
      studentDetails
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add student to class
router.post("/:classId/students", async (req, res) => {
  try {
    const { studentId } = req.body;
    
    const classData = await Class.findOne({ classId: req.params.classId });
    if (!classData) {
      return res.status(404).json({ error: "Class not found" });
    }

    if (!classData.students.includes(studentId)) {
      classData.students.push(studentId);
      await classData.save();

      // Also add class to student's classes array
      await Student.findOneAndUpdate(
        { studentId },
        { $push: { classes: classData.classId } }
      );
    }

    res.status(200).json(classData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Remove student from class
router.delete("/:classId/students/:studentId", async (req, res) => {
  try {
    const classData = await Class.findOne({ classId: req.params.classId });
    if (!classData) {
      return res.status(404).json({ error: "Class not found" });
    }

    classData.students = classData.students.filter(id => id !== req.params.studentId);
    await classData.save();

    // Also remove class from student's classes array
    await Student.findOneAndUpdate(
      { studentId: req.params.studentId },
      { $pull: { classes: classData.classId } }
    );

    res.status(200).json({ message: "Student removed from class" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get students by school (for filtering)
router.get("/school/:schoolId/students", async (req, res) => {
  try {
    const students = await Student.find({ schoolId: req.params.schoolId })
      .select('studentId name class phone');
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all subjects for a specific class name at a school
router.get("/school/:schoolId/class/:className/subjects", async (req, res) => {
  try {
    const classes = await Class.find({ 
      schoolId: req.params.schoolId,
      className: req.params.className
    });
    
    const subjects = [...new Set(classes.map(c => c.subject))];
    res.status(200).json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
