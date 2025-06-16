import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch'; // Si Node < 18

const app = express();
const PORT = 4000;

app.use(cors());

// Chargement du fichier games.json
const gamesFile = path.resolve('./games.json');
let games = [];

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

// Proxy vers l'API Steam pour les détails d'un jeu
app.get('/steam/appdetails/:appid', async (req, res) => {
  const { appid } = req.params;

  try {
    const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appid}&l=fr`);
    const data = await response.json();

    const appData = data?.[appid];

    if (!appData?.success || !appData.data || appData.data.type !== 'game') {
      console.warn(`⛔ Données Steam invalides pour appid ${appid}`);
      return res.status(404).json({ error: 'Données Steam invalides' });
    }

    res.json(appData.data); // ✅ Réponse OK
  } catch (err) {
    console.error(`❌ Erreur Steam API pour appid ${appid} :`, err.message);
    res.status(500).json({ error: 'Erreur serveur Steam' });
  }
});



// Route pour les titres populaires
app.get('/steam/popular-titles', async (req, res) => {
  try {
    // ⚠️ Ne garde que les jeux avec appid valide
    const gamesToCheck = games.filter(g => g.appid && typeof g.appid === 'number').slice(0, 100);
    const results = [];

    for (const game of gamesToCheck) {
      try {
        const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${game.appid}&l=fr`, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.warn(`⛔ Appid ${game.appid} => réponse non JSON`);
          continue;
        }

        const data = await response.json();
        const gameData = data?.[game.appid.toString()];
        if (!gameData?.success || !gameData?.data || gameData.data.type !== "game") {
          console.warn(`⛔ Appid ${game.appid} ignoré : type ou données invalides`);
          continue;
        }

        const details = gameData.data;
        const recs = details?.recommendations?.total ?? 0;
        const meta = details?.metacritic?.score ?? 0;
        const score = (recs * 0.7) + (meta * 10 * 0.3);

        results.push({ title: details.name, score });
      } catch (err) {
        console.warn(`⚠️ Appid ${game.appid} échoué :`, err.message);
      }

      await new Promise(r => setTimeout(r, 250)); // Pause pour éviter d'être bloqué
    }

    // 🔢 Trie par score décroissant
    results.sort((a, b) => b.score - a.score);

    console.log("📊 Résultats populaires :", results.slice(0, 10)); // Log utile
    res.json(results.slice(0, 10));
  } catch (error) {
    console.error("❌ Erreur /steam/popular-titles :", error.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.get('/api/metacritic/:appid', async (req, res) => {
  const { appid } = req.params;

  try {
    const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appid}&l=fr`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const json = await response.json();
    const appData = json[appid];

    if (appData?.success && appData.data?.metacritic) {
      res.json({ score: appData.data.metacritic.score });
    } else {
      res.json({ score: null });
    }
  } catch (error) {
    console.error(`❌ Erreur metacritic ${appid}:`, error.message);
    res.status(500).json({ error: "Erreur serveur Steam" });
  }
});


app.get('/api/recommendations/:appid', async (req, res) => {
  const { appid } = req.params;

  try {
    const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appid}&l=fr`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const json = await response.json();
    const appData = json[appid];

    if (appData?.success && appData.data?.recommendations) {
      res.json({ total: appData.data.recommendations.total });
    } else {
      res.json({ total: null });
    }
  } catch (error) {
    console.error(`❌ Erreur recommandations ${appid}:`, error.message);
    res.status(500).json({ error: "Erreur serveur Steam" });
  }
});



app.get('/api/games', (req, res) => {
  res.json(games);
});


// Lancement du serveur
app.listen(PORT, () => {
  console.log(`✅ API démarrée sur http://localhost:${PORT}`);
});
