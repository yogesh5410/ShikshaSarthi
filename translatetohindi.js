import fs from "fs/promises";
import fetch from "node-fetch";

const API_KEY = "AIzaSyDAz3hV4RNZJitFUFY_3RGbuPE4FCw49bY";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
const DELAY_MS = 500;
const MAX_RETRIES = 3;

let data = [];

try {
  data = JSON.parse(await fs.readFile("output.json", "utf-8"));
} catch (err) {
  console.error("❌ Failed to read or parse 'output.json':", err.message);
  process.exit(1);
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function translateText(prompt, retries = MAX_RETRIES) {
  const body = { contents: [{ parts: [{ text: prompt }] }] };

  while (retries--) {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.status === 429) {
        const errorJson = await res.json();
        const retryInfo = errorJson?.error?.details?.find(
          (d) => d["@type"] === "type.googleapis.com/google.rpc.RetryInfo"
        );

        let retryDelaySec = 30;
        if (retryInfo?.retryDelay) {
          const match = retryInfo.retryDelay.match(/(\d+)s/);
          if (match) retryDelaySec = parseInt(match[1]);
        }

        console.warn(`🔄 Rate limit hit. Waiting ${retryDelaySec}s...`);
        await delay(retryDelaySec * 1000);
        continue;
      }

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error ${res.status}: ${errorText}`);
      }

      const json = await res.json();
      const translated = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      return translated?.trim() || null;
    } catch (err) {
      console.error(
        `❌ Translation error (${MAX_RETRIES - retries}):`,
        err.message
      );
      if (retries === 0) return null;
      await delay(DELAY_MS);
    }
  }

  return null;
}

function buildPrompt(question, options) {
  return `Translate the following to Hindi. Only return the translated text. Do not include any explanation.\n\nQuestion: ${question}\nOptions:\n${options
    .map((opt, idx) => `${String.fromCharCode(65 + idx)}. ${opt}`)
    .join("\n")}`;
}

function parseTranslation(text, originalOptionCount) {
  const lines = text.split("\n").filter(Boolean);
  const questionLine = lines.find((line) => !/^[A-D]\./.test(line)) || "";
  const options = lines
    .filter((line) => /^[A-D]\./.test(line))
    .map((line) => line.slice(2).trim());

  while (options.length < originalOptionCount) options.push("");
  while (options.length > originalOptionCount)
    options.length = originalOptionCount;

  return {
    translatedQuestion: questionLine.trim(),
    translatedOptions: options,
  };
}

const translatedData = [];

for (const [i, item] of data.entries()) {
  try {
    console.log(`🔁 Translating question ${i + 1}/${data.length}...`);

    const prompt = buildPrompt(item.question, item.options);
    const translation = await translateText(prompt);
    await delay(DELAY_MS);

    if (!translation) {
      console.warn(`⚠️ Skipping question ${i + 1} due to translation failure.`);
      continue;
    }

    const { translatedQuestion, translatedOptions } = parseTranslation(
      translation,
      item.options.length
    );

    const hasEmpty =
      !translatedQuestion || translatedOptions.some((opt) => !opt.trim());
    if (hasEmpty) {
      console.warn(
        `⚠️ Skipping question ${i + 1} due to missing question/options.`
      );
      continue;
    }

    // Hint translation (optional)
    let translatedHint = "";
    if (item.hint?.text) {
      try {
        const hintPrompt = `Translate this to Hindi: ${item.hint.text}`;
        translatedHint = await translateText(hintPrompt);
        await delay(DELAY_MS);

        if (!translatedHint) {
          console.warn(`⚠️ Hint translation failed for question ${i + 1}.`);
        }
      } catch (err) {
        console.warn(
          `❌ Failed to translate hint for question ${i + 1}:`,
          err.message
        );
      }
    }

    // Translate correct answer
    let translatedCorrectAnswer = item.correctAnswer;
    if (item.correctAnswer && typeof item.correctAnswer === "string") {
      const correctIdx = item.options.findIndex(
        (opt) =>
          opt?.trim().toLowerCase() === item.correctAnswer.trim().toLowerCase()
      );
      if (correctIdx !== -1 && translatedOptions[correctIdx]) {
        translatedCorrectAnswer = translatedOptions[correctIdx];
      }
    }

    translatedData.push({
      ...item,
      question: translatedQuestion,
      options: translatedOptions,
      correctAnswer: translatedCorrectAnswer,
      hint: {
        ...item.hint,
        text: translatedHint,
      },
    });

    // Log output
    console.log(`✅ Question ${i + 1} Translated:`);
    console.log(`📝 Q: ${translatedQuestion}`);
    translatedOptions.forEach((opt, idx) => {
      console.log(`   ${String.fromCharCode(65 + idx)}. ${opt}`);
    });
    if (translatedHint) console.log(`💡 Hint: ${translatedHint}`);
    console.log(`🎯 Original Correct: ${item.correctAnswer}`);
    console.log(`🔁 Translated Correct: ${translatedCorrectAnswer}`);
    console.log("--------------------------------------------------");
  } catch (err) {
    console.error(
      `❌ Unexpected error while processing question ${i + 1}:`,
      err.message
    );
  }
}

// Save final output
try {
  await fs.writeFile(
    "output-translated.json",
    JSON.stringify(translatedData, null, 2),
    "utf-8"
  );
  console.log("✅ Translated output saved to output-translated.json");
} catch (err) {
  console.error("❌ Failed to save output:", err.message);
}
