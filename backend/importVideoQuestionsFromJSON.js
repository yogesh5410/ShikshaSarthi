const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const VideoQuestion = require("./models/VideoQuestion");
require("dotenv").config();

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Atlas connected successfully");
    console.log("   Database:", process.env.MONGO_URI.split('@')[1].split('/')[0]);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Import Video Questions from JSON file
const importVideoQuestions = async () => {
  try {
    // Read JSON file
    const jsonFilePath = path.join(__dirname, "videoQuestionsData.json");
    const jsonData = fs.readFileSync(jsonFilePath, "utf8");
    const data = JSON.parse(jsonData);

    console.log(`\n📂 Found ${data.videoQuestions.length} video questions in JSON file\n`);

    // Clear existing data (optional - comment out if you want to keep old data)
    // await VideoQuestion.deleteMany({});
    // console.log("🗑️  Cleared existing video questions\n");

    // Insert new data
    let successCount = 0;
    let errorCount = 0;

    for (const vq of data.videoQuestions) {
      try {
        // Check if this exact video question already exists
        const existing = await VideoQuestion.findOne({
          subject: vq.subject,
          class: vq.class,
          topic: vq.topic,
          videoTitle: vq.videoTitle
        });

        if (existing) {
          console.log(`⚠️  Skipping duplicate: ${vq.subject} - ${vq.topic} - ${vq.videoTitle}`);
          continue;
        }

        // Validate data
        if (!vq.questions || vq.questions.length === 0) {
          console.log(`❌ Error: No questions found for ${vq.topic}`);
          errorCount++;
          continue;
        }

        if (vq.questions.length < 5) {
          console.log(`⚠️  Warning: ${vq.topic} has only ${vq.questions.length} questions (recommended: 5)`);
        }

        // Create new video question
        const videoQuestion = new VideoQuestion(vq);
        await videoQuestion.save();
        
        successCount++;
        console.log(`✅ Added: ${vq.subject} > ${vq.topic} - ${vq.videoTitle} (${vq.questions.length} questions)`);
      } catch (err) {
        errorCount++;
        console.error(`❌ Error adding ${vq.topic}:`, err.message);
      }
    }

    console.log(`\n📊 Import Summary:`);
    console.log(`   ✅ Successfully imported: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(`   📝 Total in database: ${await VideoQuestion.countDocuments()}`);

    // Show all topics by subject
    console.log(`\n📚 Topics by Subject:`);
    const subjects = await VideoQuestion.distinct("subject");
    
    for (const subject of subjects) {
      const topics = await VideoQuestion.distinct("topic", { subject });
      console.log(`\n   ${subject}:`);
      topics.forEach((topic, index) => {
        console.log(`      ${index + 1}. ${topic}`);
      });
    }

  } catch (error) {
    console.error("❌ Error importing data:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
  }
};

// Run the import
connectDB().then(() => {
  importVideoQuestions();
});
