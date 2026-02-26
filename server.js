import "dotenv/config";
import express from "express";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/chatbot", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "chatbot.html"));
});

app.get("/code", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "code.html"));
});

app.get("/translater", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "translater.html"));
});

app.get("/shrift", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "shrift.html"));
});

app.get("/heshteg", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "heshteg.html"));
});

app.get("/idea", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "idea.html"));
});

app.post("/api/summarize", async (req, res) => {
  try {
    const { text, mode } = req.body || {};
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Matn yuborilmadi." });
    }

    const trimmed = text.trim();
    if (trimmed.length < 20) {
      return res.status(400).json({ error: "Matn juda qisqa. Kamida 20 ta belgi yuboring." });
    }

    const modeText = typeof mode === "string" ? mode : "general";
    const modeInstruction = {
      general: "Oddiy umumiy qisqartma yoz.",
      youtube: "YouTube tavsifi uchun 3-5 bandli konspekt yoz.",
      news: "Yangilik uchun 3-5 qatorda tezkor summary yoz. Faktlarni aniq saqla."
    }[modeText] || "Oddiy umumiy qisqartma yoz.";

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GROQ_API_KEY yo'q. Env o'rnating." });
    }

    const client = new OpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1"
    });

    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "Siz qisqa xulosa yozuvchi yordamchisiz. " +
            "Quyidagi matnni 3-5 qatorga qisqartir. " +
            "Faqat ozbek tilida va lotin yozuvida yoz. " +
            "Keraksiz bezaksiz, aniq va sodda bo'lsin. " +
            modeInstruction
        },
        { role: "user", content: trimmed }
      ],
      temperature: 0.3
    });

    const outputText = response?.choices?.[0]?.message?.content || "";
    if (!outputText) {
      return res.status(502).json({ error: "Javob olinmadi. Qayta urinib ko'ring." });
    }

    return res.json({ summary: outputText.trim() });
  } catch (err) {
    const message = err?.message || "Server xatosi";
    return res.status(500).json({ error: message });
  }
});

app.post("/api/bio", async (req, res) => {
  try {
    const { name, vibe, keywords } = req.body || {};
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GROQ_API_KEY yo'q. Env o'rnating." });
    }

    const client = new OpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1"
    });

    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
    const safeName = typeof name === "string" ? name.trim() : "";
    const safeVibe = typeof vibe === "string" ? vibe.trim() : "";
    const safeKeywords = typeof keywords === "string" ? keywords.trim() : "";

    const prompt =
      "Uzbek tilida 1-2 qatorlik bio yoz. " +
      "Ohang: zamonaviy, ishonchli, zo'r va professional. " +
      "Faqat lotin yozuvi. " +
      (safeName ? `Ism: ${safeName}. ` : "") +
      (safeVibe ? `Kayfiyat/uslub: ${safeVibe}. ` : "") +
      (safeKeywords ? `Kalit so'zlar: ${safeKeywords}. ` : "");

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: "Siz bio generator yordamchisiz." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    });

    const outputText = response?.choices?.[0]?.message?.content || "";
    if (!outputText) {
      return res.status(502).json({ error: "Javob olinmadi. Qayta urinib ko'ring." });
    }

    return res.json({ bio: outputText.trim() });
  } catch (err) {
    const message = err?.message || "Server xatosi";
    return res.status(500).json({ error: message });
  }
});

app.post("/api/chatbot", async (req, res) => {
  try {
    const { messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Xabarlar yuborilmadi." });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GROQ_API_KEY yo'q. Env o'rnating." });
    }

    const client = new OpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1"
    });

    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
    const systemPrompt =
      "Siz professional ozbekcha chatbot siz. " +
      "Javoblar aniq, qisqa, foydali bo'lsin. " +
      "Zarur joylarda emoji ishlatishingiz mumkin (sticker o'rniga). " +
      "Faqat lotin yozuvi.";

    const response = await client.chat.completions.create({
      model,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.5
    });

    const outputText = response?.choices?.[0]?.message?.content || "";
    if (!outputText) {
      return res.status(502).json({ error: "Javob olinmadi. Qayta urinib ko'ring." });
    }

    return res.json({ reply: outputText.trim() });
  } catch (err) {
    const message = err?.message || "Server xatosi";
    return res.status(500).json({ error: message });
  }
});

app.post("/api/code", async (req, res) => {
  try {
    const { task, language } = req.body || {};
    if (!task || typeof task !== "string") {
      return res.status(400).json({ error: "Vazifa matni yuborilmadi." });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GROQ_API_KEY yo'q. Env o'rnating." });
    }

    const client = new OpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1"
    });

    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
    const safeLang = typeof language === "string" ? language.trim() : "JavaScript";

    const prompt =
      "Quyidagi vazifa uchun kod yoz. " +
      `Dasturlash tili: ${safeLang}. ` +
      "1) Ishlaydigan kodni alohida code blockda ber. " +
      "2) Keyin qisqa izoh (2-5 band) ber. " +
      "3) Ishlatilgan kutubxonalar bo'lsa, har birini qisqacha tushuntir. " +
      "Faqat ozbek tilida va lotin yozuvida yoz. " +
      "Vazifa: " +
      task.trim();

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: "Siz professional dasturchi yordamchisiz." },
        { role: "user", content: prompt }
      ],
      temperature: 0.4
    });

    const outputText = response?.choices?.[0]?.message?.content || "";
    if (!outputText) {
      return res.status(502).json({ error: "Javob olinmadi. Qayta urinib ko'ring." });
    }

    return res.json({ result: outputText.trim() });
  } catch (err) {
    const message = err?.message || "Server xatosi";
    return res.status(500).json({ error: message });
  }
});

app.post("/api/translate", async (req, res) => {
  try {
    const { text, languages } = req.body || {};
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Matn yuborilmadi." });
    }

    if (!Array.isArray(languages) || languages.length === 0) {
      return res.status(400).json({ error: "Tarjima tillari tanlanmadi." });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GROQ_API_KEY yo'q. Env o'rnating." });
    }

    const client = new OpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1"
    });

    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
    const langList = languages.join(", ");

    const prompt =
      "Quyidagi matnni berilgan tillarga tarjima qil. " +
      "Natijani JSON formatda qaytar: {\"language\":\"translation\", ...}. " +
      "Faqat tarjimalarni yoz, qo'shimcha izohsiz. " +
      `Tilllar: ${langList}. ` +
      "Matn: " +
      text.trim();

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: "Siz professional tarjimon yordamchisiz." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3
    });

    const outputText = response?.choices?.[0]?.message?.content || "";
    if (!outputText) {
      return res.status(502).json({ error: "Javob olinmadi. Qayta urinib ko'ring." });
    }

    return res.json({ result: outputText.trim() });
  } catch (err) {
    const message = err?.message || "Server xatosi";
    return res.status(500).json({ error: message });
  }
});

app.post("/api/hashtags", async (req, res) => {
  try {
    const { text, count } = req.body || {};
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Matn yuborilmadi." });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GROQ_API_KEY yo'q. Env o'rnating." });
    }

    const client = new OpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1"
    });

    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
    const safeCount =
      typeof count === "number" && Number.isFinite(count) ? Math.max(5, Math.min(30, count)) : 15;

    const prompt =
      "Quyidagi mavzu uchun hashtaglar yoz. " +
      `Miqdori: ${safeCount}. ` +
      "Format: faqat #hashtag ko'rinishida, bir qatorda, bo'sh joy bilan ajratib ber. " +
      "Faqat ozbek tilida va lotin yozuvida. " +
      "Matn: " +
      text.trim();

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: "Siz hashtag generator yordamchisiz." },
        { role: "user", content: prompt }
      ],
      temperature: 0.6
    });

    const outputText = response?.choices?.[0]?.message?.content || "";
    if (!outputText) {
      return res.status(502).json({ error: "Javob olinmadi. Qayta urinib ko'ring." });
    }

    return res.json({ hashtags: outputText.trim() });
  } catch (err) {
    const message = err?.message || "Server xatosi";
    return res.status(500).json({ error: message });
  }
});

app.post("/api/idea", async (req, res) => {
  try {
    const { topic, count, tone } = req.body || {};
    if (!topic || typeof topic !== "string") {
      return res.status(400).json({ error: "Mavzu yuborilmadi." });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GROQ_API_KEY yo'q. Env o'rnating." });
    }

    const client = new OpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1"
    });

    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
    const safeCount =
      typeof count === "number" && Number.isFinite(count) ? Math.max(5, Math.min(25, count)) : 12;
    const safeTone = typeof tone === "string" && tone.trim() ? tone.trim() : "zamonaviy";

    const prompt =
      "Quyidagi mavzu uchun g'oyalar ro'yxatini yoz. " +
      `Miqdori: ${safeCount}. ` +
      `Ohang/uslub: ${safeTone}. ` +
      "Har bir g'oya 1 qatordan iborat bo'lsin. " +
      "Faqat ozbek tilida va lotin yozuvida yoz. " +
      "Mavzu: " +
      topic.trim();

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: "Siz g'oya generator yordamchisiz." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    });

    const outputText = response?.choices?.[0]?.message?.content || "";
    if (!outputText) {
      return res.status(502).json({ error: "Javob olinmadi. Qayta urinib ko'ring." });
    }

    return res.json({ ideas: outputText.trim() });
  } catch (err) {
    const message = err?.message || "Server xatosi";
    return res.status(500).json({ error: message });
  }
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Summary API running on http://localhost:${port}`);
  });
}

export default app;
