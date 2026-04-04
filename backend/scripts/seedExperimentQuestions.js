const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const ExperimentQuestion = require('../models/ExperimentQuestion');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// Default MongoDB URI if not in environment
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/shiksha-sarthi';

// Function to connect to MongoDB
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB successfully connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed function
const seedQuestions = async () => {
    try {
        await connectDB();

        const questionsPath = path.join(__dirname, '../data/experimentQuestions.json');
        
        if (!fs.existsSync(questionsPath)) {
            console.error('Questions data file not found at:', questionsPath);
            process.exit(1);
        }

        const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
        console.log(`Found ${questionsData.length} questions to process.`);

        let stats = {
            added: 0,
            updated: 0,
            skipped: 0,
            errors: 0
        };

        for (const qData of questionsData) {
            try {
                // Check if question exists (same experiment name and question text)
                const existingQuestion = await ExperimentQuestion.findOne({
                    experimentName: qData.experimentName,
                    question: qData.question
                });

                if (existingQuestion) {
                    // Update if necessary
                    let needsUpdate = false;
                    
                    // Simple check on properties (can be expanded)
                    if (existingQuestion.correctAnswer !== qData.correctAnswer ||
                        JSON.stringify(existingQuestion.options) !== JSON.stringify(qData.options) || 
                        existingQuestion.explanation !== qData.explanation) {
                        needsUpdate = true;
                    }

                    if (needsUpdate) {
                         await ExperimentQuestion.findByIdAndUpdate(existingQuestion._id, qData);
                         console.log(`Updated question: "${qData.question}" for ${qData.experimentName}`);
                         stats.updated++;
                    } else {
                        // console.log(`Skipped (already up to date): "${qData.question}"`);
                        stats.skipped++;
                    }
                } else {
                    // Create new
                    await ExperimentQuestion.create(qData);
                    console.log(`Added new question: "${qData.question}" for ${qData.experimentName}`);
                    stats.added++;
                }

            } catch (err) {
                console.error(`Error processing question "${qData.question}":`, err.message);
                stats.errors++;
            }
        }

        console.log('\n--- Seeding Complete ---');
        console.log(`Added: ${stats.added}`);
        console.log(`Updated: ${stats.updated}`);
        console.log(`Skipped: ${stats.skipped}`);
        console.log(`Errors: ${stats.errors}`);

        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedQuestions();
