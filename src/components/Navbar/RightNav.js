import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, logout } from "./../../features/userSlice";
import { auth, googleProvider } from "./../../Firebase";
import { Avatar } from "@mui/material";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import gamesData from "../../games.json";

const Ul = styled.ul`
  list-style: none;
  display: none;
  flex-flow: row nowrap;

  li {
    padding: 18px 10px;
  }

  @media (max-width: 1279px) {
    flex-flow: column nowrap;
    align-items: center;
    backdrop-filter: blur(60px) saturate(100%);
    -webkit-backdrop-filter: blur(60px) saturate(100%);
    border-radius: 10px;

    border-left: 1px solid #666;
    position: fixed;
    transform: ${({ open }) => (open ? "translateX(0)" : "translateX(100%)")};
    top: 0;
    right: 0;

    height: 50vh;
    width: 250px;
    padding-top: 3.5rem;
    transition: transform 0.3s ease-in-out;
    display: flex;
    li {
      color: white;
    }
    a,
    a:focus {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 3px;
      font-family: #37373f;
      font-size: 16px;
      font-weight: 600;
      color: white;
      white-space: nowrap;
      transition: 0.3s;
      position: relative;
      text-decoration: none;
    }

    a:hover:before,
    li:hover > a:before,
    .active:before {
      visibility: visible;
      width: 100%;
    }
    a:hover,
    .active,
    .active:focus,
    li:hover > a {
      color: #e74c3c;
    }
  }
`;

const RightNav = ({ open }) => {
  // menu deroulant
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  // fin menu deroulant
  const [modalShow, setModalShow] = React.useState(false);
  const dispatch = useDispatch();

  const user = useSelector(selectUser);

  const handleSignOut = () => {
    console.log("Déconnexion en cours...");
    auth
      .signOut()
      .then(() => {
        console.log("Déconnexion réussie");
        dispatch(logout());
      })
      .catch((error) => {
        console.error("Erreur lors de la déconnexion:", error);
      });
  };

  const userN = auth.currentUser;
  if (userN !== null) {
    // The user object has basic properties such as display name, email, etc.
    const displayName = userN.displayName;
    const email = userN.email;
    const photoURL = userN.photoURL;
    const emailVerified = userN.emailVerified;

    // The user's ID, unique to the Firebase project. Do NOT use
    // this value to authenticate with your backend server, if
    // you have one. Use User.getToken() instead.
    const uid = userN.uid;
  }

  // État de recherche
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Charger les données de jeux depuis game.json
  useEffect(() => {
    // Ici, vous pouvez effectuer une requête fetch si les données viennent d'une API
    // mais dans ce cas, nous les importons directement
  }, []);
  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen);
  };
  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (query.length > 0) {
      const results = gamesData.filter((game) =>
        game.title.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };
  return (
    <div className="burgerNav">
      <Ul open={open}>
        <div className="div">
          <li>
            <Link
              to={{
                pathname: `/actualités/`,
              }}
            >
              Actualités
            </Link>
          </li>
          <li>
            <Link
              to={{
                pathname: `/Sorties/`,
              }}
            >
              Nouveautés
            </Link>
          </li>
          <li>
            <Link
              to={{
                pathname: `/Populaires/`,
              }}
            >
              Populaires
            </Link>
          </li>
          <li>
            <Link
              to={{
                pathname: `/PrecoFull/`,
              }}
            >
              Précommandes
            </Link>
          </li>

          <li>
            {user ? (
              <>
                <Avatar
                  src={userN.photoURL}
                  onClick={handleMenuOpen}
                  style={{ cursor: "pointer" }}
                />
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                    }}
                  >
                    <Link to="/profile">
                      {" "}
                      <span className="fa fa-user"></span> Profil{" "}
                    </Link>
                  </MenuItem>
                  <MenuItem onClick={handleMenuClose}>
                    <Link to="/settings">
                      <span className="fa fa-cog"></span> Paramètres
                    </Link>
                  </MenuItem>
                  <MenuItem onClick={handleMenuClose}>
                    <Link
                      onClick={() => {
                        handleSignOut();
                      }}
                    >
                      <span className="fa fa-sign-out"></span> Déconnexion
                    </Link>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              // Si l'utilisateur n'est pas connecté, affichez un lien de connexion
              <Link to="/Login">
                <span className="fa fa-user"></span>
              </Link>
            )}
          </li>
          <li>
                                <a href="#" onClick={handleSearchToggle}>
                                    <span className="fa fa-search"></span>
                                </a>
                                <div className="search-container">
                                    <input 
                                        type="text"
                                        className={searchOpen ? "show" : ""}
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        placeholder="Rechercher des jeux..."
                                    />
                                    {searchOpen && (
                                      <div className="search-results">
                                        {searchResults.map((result, index) => (
                                            <div key={index} className="search-result-item">
                                              <Link  key={result.id}
                      {...result}
                      to={{
                        pathname: `/PC/${result.id}/${result.title}`,
                        state: { itemData: result }, // Passer les données de l'élément à la page BlocArticle
                      }}> {result.title}</Link> 
                                            </div>
                                        ))}
                                      </div>
                                    )}
                                </div>
                            </li>
                          
                          
        </div>
      </Ul>
    </div>
  );
};

export default RightNav;
