// scripts/translate.js
require("dotenv").config();

const fs = require("fs");
const path = require("path");

console.log("Groq API Key loaded:", !!process.env.GROQ_API_KEY);

const LANGUAGES = {
  hi: "Hindi (Devanagari script)",
  de: "German",
};

async function translateJson(targetLang, targetLangName) {
  console.log(`\n🌍 Translating to ${targetLangName}...`);

  const sourceFile = path.join(__dirname, "../messages/en.json");
  const targetFile = path.join(__dirname, `../messages/${targetLang}.json`);

  const sourceData = JSON.parse(fs.readFileSync(sourceFile, "utf8"));

  const prompt = `You are a professional translator. Translate the following JSON into ${targetLangName}.

CRITICAL RULES:
- Keep ALL keys EXACTLY the same (do not translate keys)
- Translate ONLY the values
- Preserve the exact JSON structure
- Preserve any HTML tags, variables like {name}, or placeholders
- Return ONLY valid JSON without any markdown formatting, explanations, or code blocks

JSON to translate:
${JSON.stringify(sourceData, null, 2)}`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a professional translator. You ONLY return valid JSON without any markdown formatting or explanations.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API Error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    let text = data.choices[0].message.content.trim();

    // Clean up any markdown formatting that might slip through
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    // Try to parse the JSON
    const translatedData = JSON.parse(text);

    // Write to file
    fs.writeFileSync(
      targetFile,
      JSON.stringify(translatedData, null, 2),
      "utf8"
    );

    console.log(`✅ ${targetLangName} completed → ${targetFile}`);
  } catch (err) {
    console.error(`❌ Failed for ${targetLangName}:`, err.message);
    if (err.message.includes("JSON")) {
      console.error("   Response was not valid JSON. The API might have added extra text.");
    }
    throw err;
  }
}

async function main() {
  if (!process.env.GROQ_API_KEY) {
    console.error("❌ GROQ_API_KEY missing in .env file");
    console.error("\n📝 Get your FREE API key:");
    console.error("   1. Go to: https://console.groq.com/keys");
    console.error("   2. Sign up (it's free!)");
    console.error("   3. Create an API key");
    console.error("   4. Add to .env file: GROQ_API_KEY=gsk_...\n");
    process.exit(1);
  }

  console.log("🚀 Starting FREE AI-powered translation with Groq...\n");

  for (const [code, name] of Object.entries(LANGUAGES)) {
    await translateJson(code, name);
    // Small delay between requests to be respectful
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log("\n✨ All translations completed!");
}

main().catch((error) => {
  console.error("\n💥 Translation failed:", error.message);
  process.exit(1);
});