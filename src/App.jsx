import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LastGames from './components/LastGames';
import GameDetails from './components/GameDetails';
import Popular from './components/Popular';

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