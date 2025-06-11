import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const GameDetails = () => {
  const { appid } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appid}&l=fr`);
        const data = await res.json();

        if (data[appid]?.success) {
          setGame(data[appid].data);
        } else {
          setError("Jeu introuvable");
        }
      } catch (err) {
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetails();
  }, [appid]);

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

      {/* Vidéos */}
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
                src={movie.webm.max} // ou movie.mp4.max pour compatibilité
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GameDetails;
