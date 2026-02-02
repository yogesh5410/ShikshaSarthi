// jsontodata.js
import { readFile, writeFile } from "fs/promises";
import path from "path";

async function convertQuestions() {
  try {
    // Load the original questions JSON file
    const data = await readFile("test.questions.json", "utf-8");
    const questions = JSON.parse(data);

    // Convert each question to match the mongoose schema
    const converted = questions.map((q) => ({
      subject: q.subject,
      class: q.class,
      topic: q.topic,
      question: q.question,
      questionImage: q.questionImage || "",
      options: q.options,
      correctAnswer: q.correctAnswer,
      hint: {
        text: q.hint?.text || "",
        image: q.hint?.image || "",
        video: q.hint?.video || "",
      },
    }));

    // Write to a new file
    await writeFile(
      "converted_questions.json",
      JSON.stringify(converted, null, 2),
      "utf-8"
    );

    console.log(
      "✅ Conversion completed. Output saved to converted_questions.json"
    );
  } catch (err) {
    console.error("❌ Error during conversion:", err);
  }
}

convertQuestions();
