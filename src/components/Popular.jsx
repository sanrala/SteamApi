import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Popular = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/games');
        const data = await response.json();

        // Trier par popularité descendante
        const sorted = data
          .filter(g => g.recommendations?.total)
          .sort((a, b) => b.recommendations.total - a.recommendations.total)
          .slice(0, 10);

        setGames(sorted);
      } catch (err) {
        setError("Erreur lors du chargement des jeux.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  if (loading) return <div className="container mt-5">Chargement...</div>;
  if (error) return <div className="container mt-5 text-danger">{error}</div>;

  return (
    <div className="container mt-5">
      <h1 className="mb-4">🔥 Jeux les plus populaires</h1>
      {games.map((game) => (
        <div key={game.appid} className="card mb-3 p-3">
          <h4>
            <Link to={`/game/${game.appid}`}>{game.name}</Link>
          </h4>
          {game.header_image && (
            <img src={game.header_image} alt={game.name} style={{ maxWidth: '300px' }} />
          )}
          <p><strong>👍 Recommandations :</strong> {game.recommendations.total.toLocaleString()}</p>
          <p><strong>Date de sortie :</strong> {game.release_date?.date}</p>
        </div>
      ))}
    </div>
  );
};

export default Popular;
