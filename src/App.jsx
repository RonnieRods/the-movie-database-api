import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import { WatchlistProvider } from './context/WatchlistContext';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <WatchlistProvider>
      {/* Ensure BrowserRouter knows its home base with basename prop */}
      <BrowserRouter basename='/the-movie-database-api'>
        <ScrollToTop /> {/* Fires on every route change */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:type/:id" element={<MovieDetail />} />
        </Routes>
      </BrowserRouter>
    </WatchlistProvider>
  );
}

export default App