import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Popular.css';

const Popular = () => {
  const [games, setGames] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const res = await fetch('http://localhost:4000/steam/popular');
        const data = await res.json();
        setGames(data);
      } catch (err) {
        console.error('Erreur de récupération des jeux populaires :', err);
      }
    };
    fetchPopular();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % games.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [games]);

  if (games.length === 0) {
    return <div className="text-center mt-5 text-light">Chargement des jeux...</div>;
  }
  
  if (!games[index]) {
    return <div className="text-center mt-5 text-danger">Jeu indisponible ou données incomplètes.</div>;
  }
  
  const game = games[index];
  
  // Ici ton JSX normal pour l’affichage du jeu
  

  const getThumbnails = () => {
    const thumbnails = [];
    for (let i = 1; i <= 6; i++) {
      thumbnails.push(games[(index + i) % games.length]);
    }
    return thumbnails;
  };

  return (
    <div className="container my-5 popular-section text-light bg-dark p-4 rounded">
      <h2 className="text-center mb-4">🎮 Jeux Populaires</h2>
      <div className="row">
        {/* Image principale */}
        <div className="col-md-8 d-flex justify-content-center align-items-center">
          <Link to={`/game/${games[index].appid}`} className="text-decoration-none text-light w-100">
            <div className="position-relative shadow-lg coverflow-effect rounded overflow-hidden">
              <img
                src={games[index].header_image}
                className="img-fluid w-100"
                alt={games[index].name}
                style={{ height: '400px', objectFit: 'cover' }}
              />
              <div className="position-absolute bottom-0 w-100 text-center bg-dark bg-opacity-75 py-2">
                <h5 className="m-0">{games[index].name}</h5>
              </div>
            </div>
          </Link>
        </div>

        {/* Miniatures verticales */}
        <div className="col-md-4 d-flex flex-column gap-3">
          {getThumbnails().map((game) => (
            <Link
              to={`/game/${game.appid}`}
              key={game.appid}
              className="text-decoration-none"
            >
              <div
                className="d-flex align-items-center shadow-sm p-2 rounded bg-secondary thumbnail-item"
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={game.header_image}
                  alt={game.name}
                  className="img-thumbnail me-2"
                  style={{ width: '80px', height: '50px', objectFit: 'cover' }}
                />
                <span className="text-truncate text-light">{game.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Popular;
