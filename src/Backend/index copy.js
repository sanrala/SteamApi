// import fetch from 'node-fetch';
// import fs from 'fs';
// import { setTimeout as wait } from 'timers/promises';

// const OUTPUT_FILE = 'games.json';

// async function getAppList() {
//   const res = await fetch('https://api.steampowered.com/ISteamApps/GetAppList/v2/');
//   const json = await res.json();
//   return json.applist.apps;
// }

// async function getAppDetails(appid) {
//   const url = `https://store.steampowered.com/api/appdetails?appids=${appid}&l=fr`;
//   try {
//     const res = await fetch(url);
//     const json = await res.json();

//     if (json[appid] && json[appid].success) {
//       const data = json[appid].data;

//       // On filtre seulement les vrais jeux
//       if (data.type !== 'game') return null;

//       return {
//         appid,
//         name: data.name,
//         release_date: data.release_date?.date || null, // NE TOUCHE PAS À LA DATE
//         header_image: data.header_image || null,
//         short_description: data.short_description || null,
//       };
//     }
//   } catch (e) {
//     console.error(`❌ Erreur appid ${appid} :`, e.message);
//   }
//   return null;
// }

// async function main() {
//   console.log("📥 Chargement de la liste d'apps Steam...");
//   const allApps = await getAppList();

//   // On reprend depuis le fichier si déjà existant
//   let saved = [];
//   if (fs.existsSync(OUTPUT_FILE)) {
//     saved = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
//   }

//   const alreadyDone = new Set(saved.map(game => game.appid));
//   const allToProcess = allApps.filter(app => !alreadyDone.has(app.appid));

//   console.log(`🟢 ${saved.length} jeux déjà traités, ${allToProcess.length} restants.`);

//   for (let i = 0; i < allToProcess.length; i++) {
//     const app = allToProcess[i];
//     console.log(`➡️ (${i + 1}/${allToProcess.length}) Appid ${app.appid} - ${app.name}`);

//     const details = await getAppDetails(app.appid);
//     if (details) {
//       saved.push(details);
//       fs.writeFileSync(OUTPUT_FILE, JSON.stringify(saved, null, 2), 'utf-8');
//       console.log(`✅ Ajouté : ${details.name}`);
//     } else {
//       console.log(`⏩ Ignoré ou non valide`);
//     }

//     await wait(300); // Pause de 300ms
//   }

//   console.log(`🎉 Terminé. ${saved.length} jeux enregistrés dans ${OUTPUT_FILE}`);
// }

// main().catch(console.error);

import fetch from 'node-fetch';
import fs from 'fs';
import { setTimeout as wait } from 'timers/promises';

const OUTPUT_FILE = 'games.json';
const IGNORED_FILE = 'ignored.json';

async function getAppList() {
  const res = await fetch('https://api.steampowered.com/ISteamApps/GetAppList/v2/');
  const json = await res.json();
  return json.applist.apps;
}

async function getAppDetails(appid) {
  const url = `https://store.steampowered.com/api/appdetails?appids=${appid}&l=fr`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const json = await res.json();

    if (json[appid] && json[appid].success) {
      const data = json[appid].data;

      if (data.type !== 'game') return null;

      return {
        appid,
        name: data.name,
        release_date: data.release_date?.date || null,
        header_image: data.header_image || null,
        short_description: data.short_description || null,
      };
    }
  } catch (e) {
    throw new Error(e.message);
  }
  return null;
}

async function main() {
  console.log("📥 Chargement de la liste d'apps Steam...");
  const allApps = await getAppList();

  // Chargement des fichiers existants
  let saved = fs.existsSync(OUTPUT_FILE) ? JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8')) : [];
  let ignored = fs.existsSync(IGNORED_FILE) ? JSON.parse(fs.readFileSync(IGNORED_FILE, 'utf-8')) : [];

  const alreadyDone = new Set([...saved.map(g => g.appid), ...ignored]);

  const toProcess = allApps.filter(app => !alreadyDone.has(app.appid));
  console.log(`🟢 ${saved.length} jeux, ${ignored.length} ignorés, ${toProcess.length} à analyser.`);

  let added = 0;
  for (let i = 0; i < toProcess.length; i++) {
    const app = toProcess[i];
    try {
      const details = await getAppDetails(app.appid);

      if (details) {
        console.log(`➡️ Appid ${app.appid} - ${details.name}`);
        saved.push(details);
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(saved, null, 2), 'utf-8');
        added++;
        console.log(`✅ Ajouté`);
      } else {
        ignored.push(app.appid);
        fs.writeFileSync(IGNORED_FILE, JSON.stringify(ignored, null, 2), 'utf-8');
      }

    } catch (e) {
      console.error(`❌ Erreur appid ${app.appid} : ${e.message}`);
      ignored.push(app.appid);
      fs.writeFileSync(IGNORED_FILE, JSON.stringify(ignored, null, 2), 'utf-8');
    }

    // Pause entre 1s et 2s
    await wait(Math.floor(Math.random() * 1000) + 1000);
  }

  console.log(`🎉 Terminé. ${added} nouveaux jeux ajoutés.`);
}

main().catch(console.error);
