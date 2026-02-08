require("dotenv").config({ path: __dirname + "/../.env" });

const SUBJECT = process.env.TARGET_SUBJECT || "विज्ञान";

const mongoose = require("mongoose");
const { exec } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");
const os = require("os");
const path = require("path");

const Question = require("../models/Question");
const AudioQuestion = require("../models/AudioQuestion");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

const execPromise = promisify(exec);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

// Target topics for गणित (Mathematics)
const TARGET_TOPICS = [
  "कोशिका" 
];



/**
 * Generate MP3 from text using Piper TTS
 * Uses temporary directory to avoid cluttering the project
 */
const generateMP3 = async (text, tempDir) => {
  const wavPath = path.join(tempDir, "temp.wav");
  const mp3Path = path.join(tempDir, "temp.mp3");

  // Escape special characters in text for shell
  const escapedText = text.replace(/"/g, '\\"');

  // Step 1: Generate WAV using Piper
 /* const piperCmd = `echo "${escapedText}" | piper -m ~/piper-voices/hi/hi_IN-pratham-medium.onnx --length_scale 1.18 -f ${wavPath}`; */
  const piperCmd = `echo "${escapedText}" | python3 -m piper -m /home/amathul/hi_IN-pratham-medium.onnx --length_scale 1.18 -f ${wavPath}`;

  try {
    await execPromise(piperCmd);
    console.log("  ✓ WAV generated");
  } catch (error) {
    console.error("  ✗ Piper TTS failed:", error.message);
    throw error;
  }

  // Step 2: Convert WAV to MP3 using lame
  const lameCmd = `lame ${wavPath} ${mp3Path}`;
  
  try {
    await execPromise(lameCmd);
    console.log("  ✓ Converted to MP3");
  } catch (error) {
    console.error("  ✗ Lame conversion failed:", error.message);
    throw error;
  }

  // Step 3: Read MP3 buffer
  const mp3Buffer = fs.readFileSync(mp3Path);

  // Step 4: Clean up temporary files immediately
  try {
    fs.unlinkSync(wavPath);
    fs.unlinkSync(mp3Path);
    console.log("  ✓ Temporary files cleaned");
  } catch (error) {
    console.warn("  ⚠ Warning: Could not clean temp files:", error.message);
  }

  return mp3Buffer;
};

/**
 * Main conversion function
 */
const convertAll = async () => {
  console.log("🎵 Starting Audio Question Generation...\n");
 // console.log(`Subject: गणित`);
 console.log(`Subject: ${SUBJECT}`);

  console.log(`Topics: ${TARGET_TOPICS.join(", ")}\n`);

  // Create temporary directory for audio processing
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "audio-gen-"));
  console.log(`📁 Using temp directory: ${tempDir}\n`);

  try {
    // Find questions matching the criteria
    /*const questions = await Question.find({
      subject: "गणित",
      topic: { $in: TARGET_TOPICS }
    }); */
    
    const questions = await Question.find({
  subject: SUBJECT,
  topic: { $in: TARGET_TOPICS }
});

    console.log(`📚 Found ${questions.length} questions to process\n`);

    if (questions.length === 0) {
      console.log("⚠️  No questions found for the specified topics");
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      console.log(`\n[${i + 1}/${questions.length}] Processing:`);
      console.log(`  Topic: ${q.topic}`);
      console.log(`  Question: ${q.question.substring(0, 50)}...`);

      try {
        // Check if audio question already exists
        const exists = await AudioQuestion.findOne({
          subject: q.subject,
          class: q.class,
          topic: q.topic,
          question: q.question
        });

        if (exists) {
          console.log("  ⚠️  Already exists, skipping...");
          continue;
        }

        // Generate MP3 (temp files are cleaned inside the function)
        const mp3Buffer = await generateMP3(q.question, tempDir);

        // Upload to Cloudinary
        console.log("  ⬆️  Uploading to Cloudinary...");
        const audioUrl = await uploadToCloudinary(mp3Buffer);
        console.log("  ✓ Uploaded successfully");

        // Save to AudioQuestion collection
        await AudioQuestion.create({
          subject: q.subject,
          class: q.class,
          topic: q.topic,
          question: q.question,
          questionImage: q.questionImage,
          options: q.options,
          correctAnswer: q.correctAnswer,
          hint: q.hint,
          audio: audioUrl
        });

        console.log("  ✅ Saved with audio!");
        successCount++;

      } catch (error) {
        console.error("  ❌ Error:", error.message);
        errorCount++;
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📊 Summary:");
    console.log(`  ✅ Success: ${successCount}`);
    console.log(`  ❌ Errors: ${errorCount}`);
    console.log(`  📝 Total: ${questions.length}`);
    console.log("=".repeat(50));

  } catch (error) {
    console.error("\n❌ Fatal error:", error);
  } finally {
    // Clean up temp directory
    try {
      fs.rmdirSync(tempDir);
      console.log(`\n🧹 Cleaned up temp directory`);
    } catch (error) {
      console.warn(`⚠️  Could not remove temp directory: ${error.message}`);
    }

    // Close MongoDB connection
    await mongoose.connection.close();
    console.log("\n✅ ALL DONE!");
    process.exit(0);
  }
};

// Run the conversion
convertAll().catch((error) => {
  console.error("💥 Unhandled error:", error);
  process.exit(1);
});
