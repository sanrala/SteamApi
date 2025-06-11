import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Popular from "./../components/Popular"
import Nav from "./Navbar/Navbar"

const GAMES_PER_PAGE = 10;

const LastGames = () => {
  const [allGames, setAllGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [search, setSearch] = useState('');
  const [sortDesc, setSortDesc] = useState(true);
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Charger TOUS les jeux au lieu de juste les 10 derniers jours
  useEffect(() => {
    fetch('/games.json')
      .then(res => res.json())
      .then(data => {
        setAllGames(data);
      });
  }, []);

  // Appliquer les filtres
  useEffect(() => {
    let games = [...allGames];

    if (search) {
      games = games.filter(game =>
        game.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      games = games.filter(game => {
        const date = new Date(game.release_date);
        return date >= start && date <= end;
      });
    }

    games.sort((a, b) => {
      const da = new Date(a.release_date);
      const db = new Date(b.release_date);
      return sortDesc ? db - da : da - db;
    });

    setFilteredGames(games);
    setPage(1);
  }, [search, sortDesc, startDate, endDate, allGames]);

  const paginated = filteredGames.slice(
    (page - 1) * GAMES_PER_PAGE,
    page * GAMES_PER_PAGE
  );

  const totalPages = Math.ceil(filteredGames.length / GAMES_PER_PAGE);

  return (
    <div>
    <Nav/>
    <div className="container my-5">
    
      <h2 className="mb-4 text-center">🎮 Jeux disponibles</h2>

      {/* Filtres */}
      <div className="row mb-4 g-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Rechercher un jeu..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="col-md-3">
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="col-md-3">
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="col-md-12 text-end">
          <button
            onClick={() => setSortDesc(!sortDesc)}
            className="btn btn-primary"
          >
            Trier par date {sortDesc ? '⬇️' : '⬆️'}
          </button>
        </div>
      </div>

      {/* Message si aucun jeu */}
      {filteredGames.length === 0 && (
        <div className="alert alert-warning text-center">
          Aucun jeu ne correspond aux critères sélectionnés.
        </div>
      )}


      {/* populaires*/}

      <Popular/>
      <Link to="/popular">Jeux Populaires</Link>




      FIN

      {/* Liste de jeux */}
      <div className="row g-4">
        {paginated.map(game => (
          <div key={game.appid} className="col-md-4">
            <div className="card h-100">
              <Link to={`/game/${game.appid}`}>
                <img
                  src={game.header_image}
                  alt={game.name}
                  className="card-img-top"
                />
              </Link>
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">
                  <Link to={`/game/${game.appid}`} className="text-decoration-none">
                    {game.name}
                  </Link>
                </h5>
                <p className="card-text text-muted mb-1">{game.release_date}</p>
                <p className="card-text small">{game.short_description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
          <button
            className="btn btn-outline-secondary"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            ← Précédent
          </button>

          <span className="fw-semibold">
            Page {page} / {totalPages}
          </span>

          <button
            className="btn btn-outline-secondary"
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
    </div>
  );
};

export default LastGames;
