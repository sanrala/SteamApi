import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LastGames from './components/LastGames';
import GameDetails from './components/GameDetails';
import Popular from './components/Popular';
// dans main.jsx ou App.jsx
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LastGames />} />
        <Route path="/popular" element={<Popular />} />
        <Route path="/game/:appid" element={<GameDetails />} />
      </Routes>
    </Router>
  );
}
export default App;