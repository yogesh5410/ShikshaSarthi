import xlsx from "xlsx";
import fs from "fs";

// Load CSV file
const workbook = xlsx.readFile("pyqquestion.csv", { type: "file", raw: true });
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Convert CSV to JSON
const rows = xlsx.utils.sheet_to_json(sheet);

// Function to clean option text
const cleanOption = (text) => text?.replace(/^\(\d\)\s*/, "").trim();

const output = rows.map((row, idx) => {
  const options = [
    cleanOption(row["OPT - A"]),
    cleanOption(row["OPT - B"]),
    cleanOption(row["OPT - C"]),
    cleanOption(row["OPT - D"]),
  ];

  const correctOptionRaw = String(row[" Correct Option"]).trim();
  const correctIndex = parseInt(correctOptionRaw, 10) - 1;

  let correctAnswer = "";
  if (correctIndex >= 0 && correctIndex < options.length) {
    correctAnswer = options[correctIndex];
  } else {
    console.warn(
      `❗ Row ${idx + 2}: Invalid correct option index "${correctOptionRaw}"`
    );
  }

  return {
    class: "NMMS",
    subject: "मानसिक क्षमता परीक्षण",
    topic: "पूर्ववर्षीय प्रश्नपत्र",
    question: String(row["Questions"]).replace(/\n/g, " ").trim(),
    options,
    correctAnswer,
    hint: {
      text: row["Hint"] || "",
      image: row["Image Link"] || "",
      video: row["Video Link"] || "",
    },
    questionImage: "",
    level: row["Level"] || "",
  };
});

// Save JSON to file
fs.writeFileSync("output.json", JSON.stringify(output, null, 2), "utf-8");

console.log("✅ JSON file generated from CSV as output.json");
