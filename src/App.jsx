import { useEffect, useState } from 'react'
import { getPopularMovies, searchMovies, getGenres, getMoviesByGenre } from './services/api'
import './App.css'

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [showBackToTop, setShowBackToTop] = useState(false);
  // Initialize from localStorage or empty array
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem("my_movie_watchlist");
    return saved ? JSON.parse(saved) : [];
  });
  const [viewWatchlist, setViewWatchlist] = useState(false);

  // Load popular movies by default
  useEffect(() => {
    //Fetch initial data
    getPopularMovies().then(setMovies);
    getGenres().then(setGenres);

    // Update localStorage whenever the watchlist changes
    localStorage.setItem("my_movie_watchlist", JSON.stringify(watchlist));

    const handleScroll = () => {
      // Show button after scrolling down 500px
      setShowBackToTop(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);

  }, [watchlist]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setPage(1);
    setMovies([]);
    if (!searchQuery.trim()) return;
    const results = await searchMovies(searchQuery);
    setMovies(results);
  };

  const handleGenreClick = async (id) => {
    setIsLoading(true); // Start loading
    setSelectedGenre(id);
    try {
      const results = await getMoviesByGenre(id);
      setMovies(results);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setIsLoading(false); // Stop loading regardless of success/fail
    }
  };

  const loadMoreMovies = async (e) => {
    e.preventDefault(); // Prevents browser-default scrolling/reloading
    const nextPage = page + 1;
    setIsLoading(true);

    try {
      let newMovies = [];
      if (searchQuery) {
        newMovies = await searchMovies(searchQuery, nextPage);
      } else if (selectedGenre) {
        newMovies = await getMoviesByGenre(selectedGenre, nextPage);
      } else {
        newMovies = await getPopularMovies(nextPage);
      }

      // Filter out any movies that already exist in our current state
      setMovies((prev) => {
        const existingIds = new Set(prev.map(movie => movie.id));
        const uniqueNewMovies = newMovies.filter(movie => !existingIds.has(movie.id));
        return [...prev, ...uniqueNewMovies];
      });

      setPage(nextPage);
    } catch (error) {
      console.error("Failed to load more:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWatchlist = (movie) => {
    setWatchlist((prev) => {
      const isAdded = prev.some((m) => m.id === movie.id);
      if (isAdded) {
        // Remove if already there
        return prev.filter((m) => m.id !== movie.id);
      } else {
        // Add if not there
        return [...prev, movie];
      }
    });
  };

  const displayedMovies = viewWatchlist ? watchlist : movies;

  return (
    <>
      <div className="min-h-screen bg-slate-900 text-white p-8">
        {/* Genre Chips Container */}
        <div className="flex flex-wrap gap-3 mb-10 max-w-6xl mx-auto">
          <button
            onClick={() => { 
              setSelectedGenre(null); 
              getPopularMovies().then(setMovies); 
            }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!selectedGenre ? 'bg-blue-600' : 'bg-slate-800 hover:bg-slate-700'}`}
          >
            All
          </button>
          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => handleGenreClick(genre.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedGenre === genre.id ? 'bg-blue-600' : 'bg-slate-800 hover:bg-slate-700'}`}
            >
              {genre.name}
            </button>
          ))}
        </div>
        
        
        {/* Header & Search */}
        <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <h1 className="text-4xl font-black tracking-tighter text-blue-500">
            FLIX
            <span className="text-white">FLOW</span>
          </h1>

          <form onSubmit={handleSearch} className='relative w-full md:w-96'>
            <input 
              type="text"
              placeholder='Search for movies...'
              className='w-full bg-slate-800 border-none rounded-full py-3 px-6 focus:ring-2 focus:ring-blue-500 transition=all outline-none'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
            <button type='submit' className='absolute right-2 top-1.5 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full text-sm font-medium transition-colors'>
              Search
            </button>
          </form>
          <button
            onClick={() => setViewWatchlist(!viewWatchlist)}
            className={`px-4 py2 rounded-lg font-bold transition-all ${viewWatchlist ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300'}`}
          >
            {viewWatchlist ? "View All Movies" : `Watchlist (${watchlist.length})`}
          </button>
        </header>

        {/* Movie Grid */}
        <main className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {displayedMovies.map(movie => (
            <div key={movie.id} className='group bg-slate-800 rounded-xl overflow-hidden shadow-xl hover:scale-105 transition-transform duration-300'>
            {/* Watchlist Toggle Button */}
            <button
              onClick={() => toggleWatchlist(movie)}
              className='absolute top-3 right-3 z-10 p-2 rounded-full bg-slate-900/60 backdrop-ble-md hover:scale-110 transition-transform'
            >
              <span className={watchlist.some(m => m.id === movie.id) ? "text-red-500" : "text-white"}>
                {watchlist.some(m => m.id === movie.id) ? "❤️" : "🤍"}
              </span>
            </button>

              <div className="relative aspect-[2/3]">
                {movie.poster_path ? (
                  <img 
                    src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
                    alt={movie.title} 
                    className='w-full h-full object-cover' 
                  />
                ) : (
                  <div className="w-full h-full bg-slate-700 flex items-center justify-center text-slate-500">No Image</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                  <span className="text-yellow-400 font-bold text-sm">★ {movie.vote_average.toFixed(1)}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold truncate text-lg" title={movie.title}>{movie.title}</h3>
                <p className="text-slate-400 text-sm">
                  {movie.release_date ? movie.release_date.split('-')[0] : "N/A"}
                </p>
              </div>
            </div>
          ))}
        </main>

        {/* Loading spinner when clicking load more button */}
        {isLoading &&
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        }

        {/* Handle empty state of "View Watchlist" */}
        {displayedMovies.length === 0 && (
          <div className="text-center py-20">
            <h2 className="text-2xl text-slate-500 font-medium">
              {viewWatchlist ? "Your watchlist is empty! ❤️ some movies to see them here!" : "No movies found."}
            </h2>
          </div>
        )}

        {/* Load more movies button */}
        {movies.length > 0 && !isLoading && (
          <div className="flex justify-center mt-12 pb-12">
            <button
              type="button"
              onClick={loadMoreMovies}
              className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-full transition-all transform hover:scale-105 active:scale-95'
            >
              Load More
            </button>
          </div>
        )}

        {/* Back to top button */}
        {showBackToTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className='fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-all animate-bounce'
            aria-label='Back to top'
            title='Back to top'
          >
            <svg xmlns="http://w3.org" className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 10l7-7m0 0l7 7m-7-7v18' />
            </svg>
          </button>
        )}
        
      </div>

      
    </>
  )
}

export default App
