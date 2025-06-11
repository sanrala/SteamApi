import React, { useState } from "react";
import logo from "./../../assets/images/logoGames/logo.png";
import { Link } from "react-router-dom";
import "./style.css"
// import Burger from "./Burger"
function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div>
      <nav class="nk-navbar nk-navbar-top nk-navbar-sticky nk-navbar-autohide">
        <div class="container">
          <div class="nk-nav-table">
            <Link
              to={{
                pathname: `/`,
                // Passer les données de l'élément à la page BlocArticle
              }}
              class="nk-nav-logo"
            >
              <img src={logo} alt="NextGen" width="199" />
            </Link>

            <ul
              class="nk-nav nk-nav-right d-none d-lg-table-cell"
              data-nav-mobile="#nk-nav-mobile"
            >
             
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
                  }}>Précommandes</Link>
              </li>
            
          
            </ul>
        
            <ul class="nk-nav nk-nav-right nk-nav-icons">
            {/* <Burger/> */}
          
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default NavBar;
