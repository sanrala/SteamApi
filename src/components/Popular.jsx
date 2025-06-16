import React, { useEffect, useState } from "react";

const Popular = () => {
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTitles = async () => {
      try {
        const res = await fetch("http://localhost:4000/steam/popular-titles");
        const data = await res.json();
        console.log("✅ Titres populaires :", data);
        setTitles(data);
      } catch (error) {
        console.error("Erreur récupération titres populaires :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTitles();
  }, []);

  if (loading) return <p>Chargement...</p>;
  if (!titles.length) return <p>Aucun titre trouvé.</p>;

  return (
    <div className="container my-5">
      <h2>🎯 Jeux les plus populaires</h2>
      <ul>
        {titles.map((game, idx) => (
          <li key={idx}>{game.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default Popular;
