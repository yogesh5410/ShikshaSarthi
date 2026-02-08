const mongoose = require("mongoose");
require("dotenv").config();

const Question = require("../models/Question");
const Quiz = require("../models/Quiz");

async function run() {
  // 1. Connect to DB
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  // 2. Create Science Quiz
  const quiz = await Quiz.create({
    title: "Science Audio Quiz",
    subject: "Science",
    class: "6",
    questions: [],
  });

  console.log("Quiz created:", quiz._id);

  // 3. Create ONE Science question with audio
  const question = await Question.create({
    subject: "Science",
    class: "6",
    topic: "Plants",
    question: "पौधों में भोजन बनाने की प्रक्रिया क्या कहलाती है?",
    options: [
      "प्रकाश संश्लेषण",
      "वाष्पीकरण",
      "श्वसन",
      "पाचन",
    ],
    correctAnswer: "प्रकाश संश्लेषण",
    audio: "https://drive.google.com/file/d/1S2TVVg4FZPJ8fX8JEZgkCf38e2xIUiSs/view?usp=sharing",
  });

  console.log("Question created:", question._id);

  // 4. Link question to quiz
  quiz.questions.push(question._id);
  await quiz.save();

  console.log("Question linked to quiz");

  // 5. Done
  await mongoose.disconnect();
  console.log("DONE");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
