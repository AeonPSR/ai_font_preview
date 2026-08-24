import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import fs from "fs"
import path from 'path'
import { fileURLToPath } from 'url';
import cors from "cors"
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: "https://ai-font-preview.vercel.app",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

const GOOGLE_FONTS_API_KEY = process.env.GOOGLE_FONTS_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fontAssistantSystemPrompt = fs.readFileSync(
  path.join(__dirname, 'fontSystemPrompt.txt'),
  'utf-8'
);


app.get('/api/ping', (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is awake!" });
});

async function sendMessageGemini(prompt, message, filters) {
  try {
    const userContent = `Prompt: ${prompt}, Message: ${message}, Filters: ${JSON.stringify(filters)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: fontAssistantSystemPrompt,
        responseMimeType: "application/json",
      },
      contents: userContent,
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error('Erreur Gemini :', error.message);
    return null;
  }
}


// Variable pour stocker la liste des polices en mémoire
let cachedGoogleFonts = [];

async function loadGoogleFontsCache() {
  try {
    const response = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_FONTS_API_KEY}`);
    const data = await response.json();
    if (data.items) {
      cachedGoogleFonts = data.items;
      console.log(`✅ ${cachedGoogleFonts.length} polices Google chargées en cache.`);
    }
  } catch (error) {
    console.error("Erreur chargement cache Google Fonts:", error.message);
  }
}


app.post('/api/fonts', async (req, res) => {
  const prompt = req.body.prompt;
  const message = req.body.message
  const filters = req.body.filters;


  if (!prompt || !message) {
    return res.status(400).json({ error: 'Les champs prompt et message sont requis.' });
  }


  try {

    const responseGemini = await sendMessageGemini(prompt, message, filters);

    if (cachedGoogleFonts.length === 0) {
      await loadGoogleFontsCache();
    }

    const requestedFonts = responseGemini.fonts.map(f => f.toLowerCase());

    const selectedFonts = cachedGoogleFonts
      .filter(item => requestedFonts.includes(item.family.toLowerCase()))
      .map(item => ({
        family: item.family,
        category: item.category,
        link: `https://fonts.googleapis.com/css2?family=${encodeURIComponent(item.family)}&display=swap`,
        googleLink: `https://fonts.google.com/specimen/${encodeURIComponent(item.family)}`
      }));

    res.json({ response: responseGemini.response, fonts: selectedFonts });

  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération des polices." });
  }
})

app.listen(PORT, async () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  await loadGoogleFontsCache();
});