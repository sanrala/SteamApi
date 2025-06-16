import React, { useEffect, useState } from "react";
import axios from "axios";
import SearchGame from "./SearchGame";

const LastGames = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/games");

        const recentGames = res.data
          .filter((g) => g.release_date)
          .sort((a, b) => new Date(b.release_date) - new Date(a.release_date))
          .slice(0, 5);

        const detailed = [];

        for (const game of recentGames) {
          const appid = game.appid;
          let metacritic = "Non noté";
          let recommendations = "Non dispo";

          try {
            const meta = await axios.get(`http://localhost:4000/api/metacritic/${appid}`);
            if (meta.data?.score !== null) metacritic = meta.data.score;
          } catch {}

          try {
            const rec = await axios.get(`http://localhost:4000/api/recommendations/${appid}`);
            if (rec.data?.total !== null) recommendations = rec.data.total.toLocaleString();
          } catch {}

          detailed.push({
            name: game.name,
            release_date: game.release_date,
            metacritic,
            recommendations,
          });
        }

        setGames(detailed);
      } catch (err) {
        console.error("Erreur principale :", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>🎮 5 derniers jeux avec Metacritic et Recommandations</h2>
      {loading ? <p>Chargement...</p> : (
        <ul>
          {games.map((g, i) => (
            <li key={i}>
              <strong>{g.name}</strong> – {g.release_date}<br />
              🎯 Metacritic : <strong>{g.metacritic}</strong><br />
              👍 Recommandations Steam : <strong>{g.recommendations}</strong>
            </li>
          ))}
        </ul>
      )}
      <SearchGame />
    </div>
  );
};

export default LastGames;
