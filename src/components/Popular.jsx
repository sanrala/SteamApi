import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Popular = () => {
  const [popularGames, setPopularGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const res = await fetch('http://localhost:4000/steam/popular');
        const data = await res.json();
        setPopularGames(data);
      } catch (error) {
        console.error("Erreur récupération populaires :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopular();
  }, []);

  if (loading) return <div>Chargement des jeux populaires...</div>;

  return (
    <div className="my-5">
      <h3 className="text-center mb-4">🔥 Jeux les plus populaires</h3>
      <div className="row g-4">
        {popularGames.map(game => (
          <div key={game.appid} className="col-md-4">
            <div className="card h-100 shadow">
              <Link to={`/game/${game.appid}`}>
                <img src={game.header_image} alt={game.name} className="card-img-top" />
              </Link>
              <div className="card-body">
                <h5 className="card-title">
                  <Link to={`/game/${game.appid}`} className="text-decoration-none">
                    {game.name}
                  </Link>
                </h5>
                <p className="card-text text-muted small mb-1">{game.release_date}</p>
                <p className="card-text small">{game.short_description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Popular;
