import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch'; // Nécessaire si tu utilises Node.js < 18

const app = express();
const PORT = 4000;

app.use(cors());

// Chemin absolu vers games.json
const gamesFile = path.resolve('./public/games.json');
let games = [];

// Chargement du fichier JSON
fs.readFile(gamesFile, 'utf8', (err, data) => {
  if (err) {
    console.error(`❌ Erreur de lecture du fichier games.json: ${err.message}`);
  } else {
    try {
      games = JSON.parse(data);
      console.log('✅ games.json chargé avec succès');
    } catch (parseError) {
      console.error('❌ Erreur de parsing JSON:', parseError.message);
    }
  }
});

// Route pour récupérer tous les jeux
app.get('/api/games', (req, res) => {
  res.json(games);
});

// Route pour récupérer un jeu par appid
app.get('/api/game/:appid', (req, res) => {
  const game = games.find(g => g.appid == req.params.appid);
  if (game) res.json(game);
  else res.status(404).json({ error: 'Not found' });
});

// Proxy vers l'API Steam officielle
app.get('/steam/appdetails/:appid', async (req, res) => {
  const { appid } = req.params;
  try {
    const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appid}&l=fr`);
    const json = await response.json();

    if (json[appid]?.success) {
      res.json(json[appid].data);
    } else {
      res.status(404).json({ error: "Données non trouvées pour cet appid" });
    }
  } catch (error) {
    console.error('❌ Erreur fetch Steam API:', error.message);
    res.status(500).json({ error: "Erreur lors de la récupération des données Steam" });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`✅ API démarrée sur http://localhost:${PORT}`);
});
