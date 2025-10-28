import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import axios from "axios"
import fs from "fs"
import path from 'path'
import { fileURLToPath } from 'url';
import cors from "cors";


dotenv.config();

const app = express ();
app.use(cors()); // Enable CORS for all routes
app.use(express.json());
 

const GOOGLE_FONTS_API_KEY = process.env.GOOGLE_FONTS_API_KEY;
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fontAssistantSystemPrompt = fs.readFileSync(
  path.join(__dirname, 'fontSystemPrompt.txt'),
  'utf-8'
);














async function sendMessageClaude  (userPrompt , userMessage ) {

    try {

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: "claude-sonnet-4-5-20250929",
        messages: [
          { role: "user", content: `Prompt : ${userPrompt} et Message : ${userMessage}` }
        ],
        system: fontAssistantSystemPrompt,
        max_tokens: 500
      },
      {
        headers: {
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      }
    );

    // Récupération du texte brut de Claude
    let rawText = response.data.content.map(c => c.text).join('\n').trim();

    // Nettoyage des balises Markdown ```json ... ```
    rawText = rawText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();

    // Tentative de parsing JSON
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      console.warn("⚠️ Réponse non JSON, renvoyée brute :", rawText);
    }

    // ✅ Si tout est bon, on renvoie le vrai JSON propre
   return parsed

  } catch (error) {
    console.error('Erreur lors de l’appel à l’API :', error.response?.data || error.message);
    
  }


}


app.post('/api/fonts', async (req , res ) => { 
   const userPrompt = req.body.prompt;
   const userMessage = req.body.message


      if (!userPrompt || !userMessage) {
    return res.status(400).json({ error: 'Les champs prompt et message sont requis.' });
  }



  const responseClaude =  await sendMessageClaude (userPrompt , userMessage);



  try{

  
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

      res.json({ response : responseClaude.response ,  fonts: selectedFonts });




  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération des polices." });
  }
})








app.listen(PORT, () => console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`));
