// scripts/translate.js
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

console.log("GEMINI_API_KEY loaded:", !!process.env.GEMINI_API_KEY);

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const LANGUAGES = {
  hi: "Hindi (Devanagari script)",
  de: "German",
};

async function translateJson(targetLang, targetLangName) {
  console.log(`\n🌍 Translating to ${targetLangName}...`);

  const sourceFile = path.join(__dirname, "../messages/en.json");
  const targetFile = path.join(__dirname, `../messages/${targetLang}.json`);

  const sourceData = JSON.parse(fs.readFileSync(sourceFile, "utf8"));

  const prompt = `You are a professional translator.

Translate the following JSON into ${targetLangName}.

RULES:
- Keep keys EXACTLY the same
- Translate ONLY values
- Preserve JSON structure
- Preserve HTML, variables, placeholders
- Return ONLY valid JSON

JSON:
${JSON.stringify(sourceData, null, 2)}`;

  try {
    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    let text = result.text.trim();

    text = text.replace(/```json|```/g, "").trim();

    const translatedData = JSON.parse(text);

    fs.writeFileSync(
      targetFile,
      JSON.stringify(translatedData, null, 2),
      "utf8"
    );

    console.log(`✅ ${targetLangName} completed → ${targetFile}`);
  } catch (err) {
    console.error(`❌ Failed for ${targetLangName}`);
    throw err;
  }
}

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY missing");
    process.exit(1);
  }

  console.log("🚀 Starting AI-powered translation...\n");

  for (const [code, name] of Object.entries(LANGUAGES)) {
    await translateJson(code, name);
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log("\n✨ All translations completed!");
}

main().catch(console.error);
