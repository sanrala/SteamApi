import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const GameDetails = () => {
  const { appid } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [forceSteam, setForceSteam] = useState(false);

  const fetchGameDetails = async (force = false) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `http://localhost:4000/steam/appdetails/${appid}${force ? '?forceSteam=true' : ''}`
      );
      if (!response.ok) throw new Error('Erreur lors de la récupération des données Steam');
      const data = await response.json();
      if (!data || data.type !== 'game') {
        setError("Aucun jeu trouvé pour cet ID.");
      } else {
        setGame(data);
      }
    } catch (err) {
      setError("Erreur lors du chargement des détails du jeu.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appid) fetchGameDetails(forceSteam);
  }, [appid, forceSteam]);

  const handleForceSteam = () => {
    setForceSteam(true);
  };

  if (loading) return <div className="container mt-5">Chargement...</div>;
  if (error) return <div className="container mt-5 text-danger">{error}</div>;
  if (!game) return null;

  return (
    <div className="container mt-5">
      <h1 className="mb-4">{game.name}</h1>

      {game.header_image && (
        <img
          src={game.header_image}
          alt={game.name}
          className="img-fluid mb-4"
        />
      )}

      <p><strong>Date de sortie :</strong> {game.release_date?.date}</p>
      <p><strong>Description :</strong> {game.short_description}</p>
      <p><strong>Source des données :</strong> {game.source === 'steam' ? 'Steam (live)' : 'Cache local'}</p>

      <button className="btn btn-sm btn-primary mb-4" onClick={handleForceSteam}>
        🔁 Rafraîchir depuis Steam
      </button>

      {game.movies && game.movies.length > 0 && (
        <div className="mt-4">
          <h4>🎬 Vidéos</h4>
          {game.movies.map((movie) => (
            <div key={movie.id} className="mb-3">
              <h5>{movie.name}</h5>
              <video
                width="100%"
                controls
                poster={movie.thumbnail}
                src={movie.webm?.max || movie.mp4?.max}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GameDetails;
