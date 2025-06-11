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


// ➕ À ajouter dans ApiExpress.js (en bas)

app.get('/steam/popular', async (req, res) => {
  try {
    const detailedGames = [];
    const gamesToCheck = games.slice(0, 50);

    for (const game of gamesToCheck) {
      try {
        const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${game.appid}&l=fr`, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const data = await response.json();
        const appData = data[game.appid];

        if (appData?.success && appData?.data) {
          const details = appData.data;
          const recs = details?.recommendations?.total ?? 0;
          const meta = details?.metacritic?.score ?? 0;

          const popularityScore = (recs * 0.7) + (meta * 10 * 0.3);

          detailedGames.push({
            ...details,
            popularityScore
          });
        }
      } catch (err) {
        console.warn(`⚠️ Erreur interne pour le jeu ${game.appid}: ${err.message}`);
      }
    }

    detailedGames.sort((a, b) => b.popularityScore - a.popularityScore);
    res.json(detailedGames.slice(0, 10));

  } catch (error) {
    console.error("❌ Erreur globale dans /steam/popular :", error.message);
    res.status(500).json({ error: "Erreur lors de la récupération des jeux populaires" });
  }
});



// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`✅ API démarrée sur http://localhost:${PORT}`);
});
