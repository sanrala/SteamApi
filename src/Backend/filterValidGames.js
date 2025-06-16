import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const gamesFile = path.resolve('./public/games.json');
const cleanedFile = path.resolve('./public/games_valid.json');

// Chargement du fichier d'origine
let rawGames;
try {
  rawGames = JSON.parse(fs.readFileSync(gamesFile, 'utf-8'));
} catch (err) {
  console.error(`❌ Erreur lecture games.json : ${err.message}`);
  process.exit(1);
}

// Chargement des jeux déjà validés (si existants)
let validGames = [];
try {
  if (fs.existsSync(cleanedFile)) {
    validGames = JSON.parse(fs.readFileSync(cleanedFile, 'utf-8'));
    console.log(`📂 Reprise depuis games_valid.json (${validGames.length} jeux déjà validés)`);
  }
} catch (err) {
  console.warn(`⚠️ Erreur lecture games_valid.json : ${err.message}`);
}

// Liste des appids déjà traités
const alreadyDone = new Set(validGames.map(g => g.appid));

// Vérifie si un jeu est valide
const checkGameValid = async (appid) => {
  try {
    const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appid}&l=fr`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      }
    });

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      console.warn(`⛔ Appid ${appid} rejeté : réponse non JSON`);
      return false;
    }

    const json = await res.json();
    const entry = json[appid] ?? null;

    if (!entry || typeof entry !== 'object' || !entry.success || !entry.data || entry.data === null) {
      console.warn(`⛔ Appid ${appid} rejeté : données manquantes ou corrompues`);
      return false;
    }

    if (entry.data.type !== 'game') {
      console.warn(`⛔ Appid ${appid} rejeté : type ≠ "game"`);
      return false;
    }

    return true;
  } catch (e) {
    console.warn(`❌ Appid ${appid} invalide : ${e.message}`);
    return false;
  }
};

// Traitement
const cleanGames = async () => {
  for (const game of rawGames) {
    if (alreadyDone.has(game.appid)) {
      console.log(`⏭️ Appid ${game.appid} déjà validé — ignoré`);
      continue;
    }

    const isValid = await checkGameValid(game.appid);

    if (isValid) {
      console.log(`✅ Appid ${game.appid} valide`);
      validGames.push(game);
      fs.writeFileSync(cleanedFile, JSON.stringify(validGames, null, 2), 'utf-8');
    } else {
      console.warn(`⛔ Appid ${game.appid} exclu`);
    }

    // Pause de 2s pour éviter blocage Steam
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log(`✅ Traitement terminé : ${validGames.length} jeux valides`);
};

cleanGames();
