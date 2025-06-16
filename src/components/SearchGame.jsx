import React, { useState, useEffect } from "react";
import axios from "axios";

// Fonction de nettoyage : sans majuscule, accents ni espaces
const normalize = (str) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");

const SearchGame = () => {
  const [search, setSearch] = useState("");
  const [games, setGames] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [metacritic, setMetacritic] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:4000/api/games")
      .then((res) => setGames(res.data))
      .catch((err) => console.error("❌ Erreur chargement jeux :", err.message));
  }, []);

  useEffect(() => {
    const q = normalize(search);
    const filteredList = games.filter((g) =>
      normalize(g.name).includes(q)
    );
    setFiltered(q.length > 1 ? filteredList.slice(0, 5) : []);
  }, [search, games]);

  const fetchMetacritic = async (appid) => {
    try {
      const res = await axios.get(`http://localhost:4000/api/metacritic/${appid}`);
      setMetacritic(res.data?.score ?? "Non noté");
    } catch (err) {
      console.warn(`⚠️ Erreur Metacritic appid ${appid} :`, err.message);
      setMetacritic("Indisponible");
    }
  };

  const handleSelect = (game) => {
    setSelectedGame(game);
    setSearch(game.name);
    setFiltered([]);
    fetchMetacritic(game.appid);
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
      <h2>🔎 Rechercher un jeu</h2>
      <input
        type="text"
        placeholder="Tape un nom de jeu..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          fontSize: "1rem",
          marginBottom: 10,
        }}
      />
      {filtered.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {filtered.map((g) => (
            <li
              key={g.appid}
              onClick={() => handleSelect(g)}
              style={{
                padding: 8,
                borderBottom: "1px solid #ccc",
                cursor: "pointer",
                background: "#f3f3f3",
              }}
            >
              {g.name}
            </li>
          ))}
        </ul>
      )}
      {selectedGame && (
        <div style={{ marginTop: 20 }}>
          <h3>{selectedGame.name}</h3>
          <img
            src={selectedGame.header_image}
            alt={selectedGame.name}
            style={{ width: "100%", borderRadius: "8px" }}
          />
          <p style={{ marginTop: 10 }}>{selectedGame.short_description}</p>
          <p>
            🎯 <strong>Metacritic :</strong>{" "}
            {metacritic !== null ? metacritic : "Chargement..."}
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchGame;
