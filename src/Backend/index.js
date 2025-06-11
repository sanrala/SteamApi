import fetch from 'node-fetch';
import fs from 'fs';
import { setTimeout as wait } from 'timers/promises';
import './index.css';


const OUTPUT_FILE = 'games.json';

function formatDate(dateStr) {
  const months = {
    'janvier': '01', 'février': '02', 'mars': '03', 'avril': '04', 'mai': '05', 'juin': '06',
    'juillet': '07', 'août': '08', 'septembre': '09', 'octobre': '10', 'novembre': '11', 'décembre': '12'
  };
  const match = dateStr.match(/(\d{1,2})\s(\w+),?\s(\d{4})/i);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = months[match[2].toLowerCase()] || '01';
    const year = match[3];
    return `${year}-${month}-${day}`;
  }
  return null;
}

async function getAppList() {
  const res = await fetch('https://api.steampowered.com/ISteamApps/GetAppList/v2/');
  const json = await res.json();
  return json.applist.apps;
}

async function getAppDetails(appid) {
  const url = `https://store.steampowered.com/api/appdetails?appids=${appid}&l=fr`;
  try {
    const res = await fetch(url);
    const json = await res.json();

    if (json[appid] && json[appid].success) {
      const data = json[appid].data;

      // On filtre seulement les vrais jeux
      if (data.type !== 'game') return null;

      return {
        appid,
        name: data.name,
        release_date: data.release_date?.date ? formatDate(data.release_date.date) : null,
        header_image: data.header_image || null,
        short_description: data.short_description || null,
      };
    }
  } catch (e) {
    console.error(`❌ Erreur appid ${appid} :`, e.message);
  }
  return null;
}

async function main() {
  console.log("📥 Chargement de la liste d'apps Steam...");
  const allApps = await getAppList();

  // On reprend depuis le fichier si déjà existant
  let saved = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    saved = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
  }

  const alreadyDone = new Set(saved.map(game => game.appid));
  const allToProcess = allApps.filter(app => !alreadyDone.has(app.appid));

  console.log(`🟢 ${saved.length} jeux déjà traités, ${allToProcess.length} restants.`);

  for (let i = 0; i < allToProcess.length; i++) {
    const app = allToProcess[i];
    console.log(`➡️ (${i + 1}/${allToProcess.length}) Appid ${app.appid} - ${app.name}`);

    const details = await getAppDetails(app.appid);
    if (details) {
      saved.push(details);
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(saved, null, 2), 'utf-8');
      console.log(`✅ Ajouté : ${details.name}`);
    } else {
      console.log(`⏩ Ignoré ou non valide`);
    }

    await wait(300); // Pause de 300ms
  }

  console.log(`🎉 Terminé. ${saved.length} jeux enregistrés dans ${OUTPUT_FILE}`);
}

main().catch(console.error);
