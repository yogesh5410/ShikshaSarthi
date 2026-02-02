import axios from "axios";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "url";

// Necessary for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to download and save an image
async function downloadImage(imageUrl, filePath) {
  const response = await axios.get(imageUrl, { responseType: "stream" });

  await new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

// Main function to fetch and process questions
async function main() {
  try {
    const response = await axios.get("http://localhost:5000/questions");
    const questions = response.data;

    for (const q of questions) {
      const { class: className, subject, topic, questionImage } = q;

      if (!questionImage || !questionImage.trim()) continue;

      const imageName = path.basename(parse(questionImage).pathname);
      const saveDir = path.join(__dirname, "images", className, subject, topic);
      const savePath = path.join(saveDir, imageName);

      await fs.ensureDir(saveDir);
      console.log(`⬇️ Downloading: ${imageName} → ${savePath}`);
      await downloadImage(questionImage, savePath);
    }

    console.log("✅ All images downloaded successfully!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main();
