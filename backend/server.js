import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import axios from "axios"
import fs from "fs"
import path from 'path'
import { fileURLToPath } from 'url';
import cors from "cors"
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: "https://ai-font-preview-psi.vercel.app",
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

app.post('/api/fonts', async (req, res) => {
  const prompt = req.body.prompt;
  const message = req.body.message
  const filters = req.body.filters;


  if (!prompt || !message) {
    return res.status(400).json({ error: 'Les champs prompt et message sont requis.' });
  }

  const responseClaude = await sendMessageGemini(prompt, message, filters);

  try {

    const response = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_FONTS_API_KEY}`);
    const data = await response.json();
    console.log("Statut HTTP :", response.status);
    console.log("Status text :", response.statusText);
    const selectedFonts = data.items
      .filter(item => responseClaude.fonts.map(f => f.toLowerCase()).includes(item.family.toLowerCase()))
      .map(item => ({
        family: item.family,
        category: item.category,
        // lien <link> à mettre dans <head>
        link: `https://fonts.googleapis.com/css2?family=${encodeURIComponent(item.family)}&display=swap`,
        // lien pour voir/télécharger la police sur Google Fonts
        googleLink: `https://fonts.google.com/specimen/${encodeURIComponent(item.family)}`
      }));

    res.json({ response: responseClaude.response, fonts: selectedFonts });

  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération des polices." });
  }
})

app.listen(PORT, () => console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`));
