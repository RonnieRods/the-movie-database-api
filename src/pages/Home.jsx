import { useEffect, useState } from 'react'
import { searchMovies, getGenres, getMoviesByGenre } from '../services/api'
import '../App.css'
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useWatchlist } from '../context/WatchlistContext';
import axios from 'axios';
import MovieSkeleton from '../components/MovieSkeleton';

function Home() {
  const { watchlist, toggleWatchlist, setWatchlist } = useWatchlist();
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  // Initialize from localStorage or empty array
  const [viewWatchlist, setViewWatchlist] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // This reads the type from the URL (?type=tv) or defaults to "movie"
  const mediaType = searchParams.get("type") || "movie";

  // Read page from URL (?page=2), fallback to 1
  const page = searchParams.get("page") ? parseInt(searchParams.get("page")) : 1;

  // Read genre from URL, fallback to null
  const selectedGenre = searchParams.get("genre") ? parseInt(searchParams.get("genre")) : null;

  const clearWatchlist = () => {
    if (window.confirm("Are you sure you want to remove all items from your watchlist?")) {
      setWatchlist([]);
    }
  }

  // Load popular movies by default
  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        
        // Check if there is a search query in the URL
        const queryFromUrl = searchParams.get("search");
    
        try {
          let results = [];
          if (queryFromUrl) {
            // If a search exists in the URL, fetch search results instead of popular
            setSearchQuery(queryFromUrl); // Sync the input field
            results = await searchMovies(mediaType, queryFromUrl, page);
          } else if (selectedGenre) {
            // Use the genre ID from the URL
            results = await getMoviesByGenre(mediaType, selectedGenre, page);
          } else {
            // Otherwise, proceed with popular/toggle logic
            const endpoint = mediaType === "movie" ? "movie/popular" : "tv/popular";
            const response = await axios.get(
                `https://api.themoviedb.org/3/${endpoint}?api_key=${import.meta.env.VITE_TMDB_API_KEY}&page=${page}`
            );
            results = response.data.results;
          }

          // UPDATED: Logic to append movies instead of replacing them
          setMovies((prev) => {
            if (page === 1) return results; // If it's page 1, start fresh

            // If it's page 2+, add the new results to the old ones
            // We use a Set to make sure we don't add duplicate IDs
            const existingIds = new Set(prev.map(m => m.id));
            const uniqueNew = results.filter(m => !existingIds.has(m.id));
            return [...prev, ...uniqueNew];
          });

            // Update genres whenever mediaType changes
            // Keep genre logic here
            const genreList = await getGenres(mediaType);
            setGenres(genreList);
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchData(); // This handles the main grid content

    // Scroll and event listener logic
    const handleScroll = () => {
      // Show button after scrolling down 500px
      setShowBackToTop(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);

  // Add searchParams to the dependancy array
  }, [mediaType, page, selectedGenre, searchParams]); // Re-fetch whenever the toggle changes

  useEffect(() => {
    localStorage.setItem("my_watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Update the URL to include the search term
    // Preserve the current mediaType (movie/tv) while adding the search query
    navigate(`/?type=${mediaType}&search=${encodeURIComponent(searchQuery)}`);
    // The useEffect will catch this change and fetch the data!

    setIsLoading(true);
    try {
      // pass mediaType (movie or tv) to the search function
      const results = await searchMovies(mediaType, searchQuery);
      setMovies(results);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenreClick = async (id) => {
    setMovies([]); // Clear current list for a fresh feel
    setIsLoading(true); // Start loading
    setSearchQuery(""); // Clear search text
    navigate("/"); // Remove ?search= from URL

    //Update URL to include bot mediaType and selectedGenre
    // Use URLSearchParams to maintain existing params like 'type'
    const params = new URLSearchParams(searchParams);
    params.set("genre", id);
    params.delete("page") // REMOVE the page param to force a reset to 1
    params.delete("search"); // Clear search if a genre is picked

    navigate(`/?${params.toString()}`);

    try {
      // Pass 'mediaType' as the first argument
      const results = await getMoviesByGenre(mediaType, id);
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

    // Create a copy of current params and set the new page
    const params = new URLSearchParams(searchParams);
    params.set("page", nextPage);

    //Update the URL
    navigate(`/?${params.toString()}`); // Ths triggers the useEffect

    {/*
      
    try {
      let newMovies = [];
      if (searchQuery) {
        // Updated: Pass mediaType to searchMovies
        newMovies = await searchMovies(mediaType, searchQuery, nextPage);
      } else if (selectedGenre) {
        // Updated: Pass mediaType to getMovieByGenre
        newMovies = await getMoviesByGenre(mediaType, selectedGenre, nextPage);
      } else {
        // Updated: Pass mediaType to getPopularMovies 
        newMovies = await getPopularMovies(mediaType, nextPage);
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
      
    */}

    
  };


  const displayedMovies = viewWatchlist ? watchlist : movies;

  return (
    <>
      <div className="min-h-screen bg-slate-900 text-white p-8">
        {/* Media Type Handler */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-800 p-1 rounded-xl flex gap-1">
            <button
              onClick={() => {
                setSearchQuery(""); // Clears state
                navigate("/?type=movie"); // Updates URL, which triggers the useEffect
              }}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${
                mediaType === "movie" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => {
                setSearchQuery("");
                const params = new URLSearchParams(searchParams);
                params.set("type", "tv");
                params.delete("page"); // Force reset to page 1
                navigate("/?type=tv"); // Updates URL, which triggers the useEffect
              }}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${
                mediaType === "tv" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
              }`}
            >
              TV Shows  
            </button>
          </div>
        </div>
        
        {/* Genre Chips Container */}
        <div className="flex flex-wrap gap-3 mb-10 max-w-6xl mx-auto">
          <button
            onClick={() => { 
              const params = new URLSearchParams(searchParams);
              params.delete("genre");
              navigate(`/?${params.toString()}`);
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

            {/* The "X" Clear Button */} 
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  navigate(`/?type=${mediaType}`); // Clears the URL
                }}
                className='absolute right-23 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors'
              >
                ✕  
              </button>
            )}

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

        {searchParams.get("search") && movies.length > 0 && (
          <p className="max-w-6xl mx-auto text-xl font-bold pb-6 text-slate-300 italic">
            Showing results for "{searchParams.get("search")}"
          </p>
        )}

        {/* Clear All Button */}
        {viewWatchlist && watchlist.length > 0 && (
          <button
            onClick={clearWatchlist}
            className='px-4 py-2 mb-6 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/50 rounded-lg transition-all text-sm font-medium'
          >
            Clear All
          </button>
        )}

        {/* Movie Grid */}
        <main className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {isLoading && movies.length === 0
              ? Array(8).fill(0).map((_, i) => <MovieSkeleton key={i} />)
              : displayedMovies.map(movie => (
                <div key={movie.id} className='group relative bg-slate-800 rounded-xl overflow-hidden shadow-xl hover:scale-105 transition-transform duration-300'>
                    {/* Watchlist Toggle Button */}
                    <button
                      onClick={() => toggleWatchlist(movie)}
                      className={`absolute top-3 right-3 z-20 p-2 rounded-full bg-slate-900/60 backdrop-blur-md opacity-0 group-hover:opacity-100 hover:scale-110 transition-all duration-300 ${
                        watchlist.some(m => m.id === movie.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                    <span className={watchlist.some(m => m.id === movie.id) ? "text-red-500" : "text-white"}>
                        {watchlist.some(m => m.id === movie.id) ? "❤️" : "🤍"}
                    </span>
                    </button>
                    {/* This uses the current active mediaType (movie or tv) */}
                    <Link to={`/${mediaType}/${movie.id}`}>
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
                            <h3 className="font-bold truncate text-lg" title={movie.title || movie.name}>
                              {movie.title || movie.name} {/* TV uses .name */}
                            </h3>
                            <p className="text-slate-400 text-sm">
                            {new Date(movie.release_date || movie.first_air_date).toLocaleDateString('en-US', {
                              month: 'long',
                              year: 'numeric'
                            })} {/* TV uses first_air_date */}
                            </p>
                        </div>
                    </Link>
                    
                </div>
                
              ))
            }
        </main>

        {/* Loading spinner when clicking load more button */}
        {isLoading &&
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        }

        {/* No Results Found Message */}
        {!isLoading && movies.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className=" text-2xl font-bold text-white mb-2">
              No {mediaType === "movie" ? "movies" : "TV shows"} found
            </h2>
            <p className="text-slate-400 max-w-sm">
              We couldn't find anything matching "{searchQuery}".
              Try checking for typos or searching for something else!
            </p>
            <button
              onClick={() => {
                navigate(`/?type=${mediaType}`);
                setSearchQuery(""); // Clears state
              }}
              className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors font-medium"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Handle empty state of "View Watchlist" */}
        {displayedMovies.length === 0 && (
          <div className="text-center py-20">
            <h2 className="text-2xl text-slate-500 font-medium">
              {viewWatchlist ? "Your watchlist is empty! ❤️ some movies to see them here!" : "No movies found."}
            </h2>
          </div>
        )}

        {/* Show a few skeletons at the bottom when loading more */}
        {isLoading && movies.length > 0 && (
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-8">
            {Array(4).fill(0).map((_, i) => <MovieSkeleton key={i} />)}
          </div>
        )}

        {/* Load more movies button OLD
        
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
        
        */}
        

        {/* Only show Load More if user is NOT viewing the watchlist */}
        {!viewWatchlist && movies.length > 0 && (
          <div className="flex flex-col items-center mt-12 mb-20">
            <button
              onClick={loadMoreMovies}
              disabled={isLoading}
              className={`px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-bold transition-all shadow-lg ${
                isLoading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
              }`}
            >
              {isLoading ? "Loading..." : "Load More"}
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

export default Home
