import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useWatchlist } from "../context/WatchlistContext";
import { Link } from 'react-router-dom';
import { getGenres } from "../services/api";

const MovieDetail = () => {
    const { type, id } = useParams(); // Get both from URL
    const navigate = useNavigate();
    const { watchlist, toggleWatchlist } = useWatchlist();
    const [movie, setMovie] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [cast, setCast] = useState([]);
    const [trailer, setTrailer] = useState(null);
    const [localSearch, setLocalSearch] = useState("");
    const [allGenres, setAllGenres] = useState([]);
    const mediaType = type || "movie"; // 'type' comes from useParams()
    const [copied, setCopied] = useState(false);
    
    useEffect(() => {
        // Fetch Movie Details
        const fetchMovie = async () => {
            try {
                // Using append_to_response to get everything in one go
                // Use the 'type' from the URL (movie or tv)
                const response = await axios.get(
                    // Added 'videos' to append_to_response
                    `https://api.themoviedb.org/3/${type}/${id}?api_key=${import.meta.env.VITE_TMDB_API_KEY}&append_to_response=credits,recommendations,videos`
                );
                setMovie(response.data);
                setCast(response.data.credits.cast.slice(0, 10)); // Just the top 10 actors
                setRecommendations(response.data.recommendations.results.slice(0, 10)); // Top 10

                // Find the first video that is a "Trailer" on "YouTube"
                const videoData = response.data.videos.results;
                const officialTrailer = videoData.find(vid => vid.type === "Trailer" && vid.site === "YouTube");
                setTrailer(officialTrailer ? officialTrailer.key : null);

            } catch (error) {
                console.error("Error fetching movie details", error);
            }
        };
        fetchMovie();
        window.scrollTo(0, 0); // Scroll to top when movie changes
    }, [type, id]);

    useEffect(() => {
        const fetchGenres = async () => {
            // mediaType is either "movie" or "tv" from useParams()
            const genres = await getGenres(mediaType);
            setAllGenres(genres);
        };
        fetchGenres();
    }, [mediaType]);

    if (!movie) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <h2 className="text-white text-2xl animate-pulse">Loading Movie Details...</h2>
            </div>
        );
    }


    const isFavorited = watchlist.some((m) => m.id === movie?.id);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'long',
            year: 'numeric',
            day: 'numeric'
        }).format(date);
    };

    const handleDetailSearch = (e) => {
        e.preventDefault();
        if (!localSearch.trim()) return;

        // Navigate back home with a search parameter
        // This will change the URL to something like: /?search=Inception
        // Use the 'type' from useParams to stay in the correct category
        navigate(`/?type=${type}&search=${encodeURIComponent(localSearch)}`);
    };

    // Helper to find the name by ID
    const getGenreName = (id) => {
        return allGenres.find(g => g.id === id)?.name || "Genre";
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        // Reset the "Copied!" message after 2 seconds
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            {/* Top Navigation Bar with Search */}
            <div className="absolute top-0 left-0 w-full h-[500px] opacity-20 -z-10 blur-sm"
                className=""
                style={{
                    backgroundImage: `linear-gradient(to bottom, transparent, #0f172a), url(https://image.tmdb.org/t/p/w1280${movie.backdrop_path})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '100vh', // Sets height to full screen height
                    width: '100%' // Ensures it spans the full width
                }} 
            >
            </div>

            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="font-bold mb-6 px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition"
                >
                    ← Back
                </button>

                <form onSubmit={handleDetailSearch} className="relative w-full md:w-80">
                    <input 
                        type="text"
                        placeholder="Quick search..."
                        className="w-full bg-slate-800 border-none rounded-full py-2 px-5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                    />
                    <button type="submit" className="absolute right-2 top-1 bg-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                        Go
                    </button>
                </form>
            </div>

            

            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex md:flex-col flex-row justify-center gap-4">
                    <button
                        onClick={() => toggleWatchlist(movie)}
                        className={`flex-1 px-3 py-3 rounded-full font-bold transition ${
                            isFavorited ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                    >
                        {isFavorited ? '❤️ In Watchlist' : '🤍 Add to Watchlist'}
                    </button>

                    <button
                        onClick={handleCopyLink}
                        className="flex-1 px-3 py-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-all flex items-center justify-center"
                    >
                        <span>{copied ? "✅" : "🔗"}</span>
                        <span className="font-bold">
                            {copied ? "Link Copied!" : "Share Movie"}
                        </span>
                    </button>
                </div>

                <img
                    src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full md:w-96 rounded-xl shadow-2xl"
                />
                <div>
                    <h1 className="text-5xl font-bold mb-4">{movie.title}</h1>
                    <p className="text-gray-400 italic pb-6">{movie.tagline}</p>
                    <div className="flex items-center gap-6 mb-8">
                        {/* Rating Badge */}
                        <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 px-3 py-1 rounded-full text-sm font-black shadow-lg shadow-yellow-500/10">
                            <span className="mr-1">★</span>
                            {movie.vote_average?.toFixed(1)}
                            </span>
                            <span className="text-gray-500 text-xs font-medium uppercase tracking-widest">Rating</span>
                        </div>

                        {/* Release Date Badge */}
                        <div className="flex items-center gap-2">
                            <span className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1 rounded-full text-sm font-semibold">
                            {formatDate(movie.release_date || movie.first_air_date)} {/* TV uses first_air_date */}
                            </span>
                            <span className="text-gray-500 text-xs font-medium uppercase tracking-widest">
                                {movie.release_date ? "Release Date" : "First Air Date"}
                            </span>
                        </div>

                        {/* Runtime Badge (Bonus) */}
                        {movie.runtime > 0 && (
                            <div className="flex items-center gap-2 border-l border-slate-700 pl-6">
                                <span className="text-slate-300 text-sm font-medium">
                                    {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                        {movie.genres?.map(genre => (
                            <span key={genre.id} className="text-xs font-bold px-2 py-1 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded">
                                {genre.name}
                            </span>
                        ))}
                    </div>
                    
                    <p className="text-lg leading-relaxed">{movie.overview}</p>

                    {movie.number_of_seasons && (
                        <p className="text-blue-400 font-semibold pt-6">
                            {movie.number_of_seasons} {movie.number_of_seasons === 1 ? 'Season' : 'Seasons'}
                        </p>
                    )}
                </div>
            </div>

            {/* Trailer Section */}
            {trailer && (
                <div className="max-w-6xl mx-auto mt-16">
                    <h2 className="text-2xl pb-6"><b>Official Trailer</b></h2>
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
                        <iframe
                            className="absolute top-0 left-0 w-full h-full"
                            src={`https://www.youtube.com/embed/${trailer}`}
                            key={movie.id}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}

            {/* Cast Profiles Section */}
            <div className="max-w-6xl mx-auto mt-16">
                <h2 className="pb-6 text-2xl"><b>Top Cast</b></h2>
                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                    {cast.map((actor) => (
                        <div key={actor.id} className="min-w-[120px] md:min-w-[150px] text-center">
                            <div className="relative aspect-rec rounded-full overflow-hidden mb-3 border-2 border-slate-800 shadow-lg">
                                {actor.profile_path ? (
                                    <img 
                                        src={`https://image.tmdb.org/t/p/w185/${actor.profile_path}`}
                                        alt={actor.name}
                                        title={actor.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500 text-xs px-2">
                                        No Photo
                                    </div>
                                )}
                            </div>
                            <p className="text-sm font-bold truncate">{actor.name}</p>
                            <p className="text-xs text-slate-400 truncate">{actor.character}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recommendations Section */}
            {recommendations.length > 0 && (
                <div className="max-w-6xl mx-auto mt-16">
                    <h2 className="text-2xl font-bold pb-6"><b>Recommended Movies</b></h2>
                    <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                        {recommendations.map((rec) => (
                            <Link
                            // Change '/movie/' to '/${type}/'
                                to={`/${type}/${rec.id}`}
                                key={rec.id}
                                className="min-w-[150px] md:min-w-[200px] group relative overflow-hidden rounded-lg"
                            >   
                                {/* Poster Image */}
                                <img 
                                    src={`https://image.tmdb.org/t/p/w342${rec.poster_path}`}
                                    // Use || for TV show titles
                                    alt={rec.title || rec.name} 
                                    className='w-full h-auto transition-transform duration-300 group-hover:scale-110' 
                                />

                                {/* Genre Badges Overlay */}
                                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                                    {rec.genre_ids.slice(0, 2).map((genreId) => (
                                        <span
                                            key={genreId}
                                            className="px-2 py-0.5 text-[10px] font-bold bg-blue-600/80 backdrop-blur-sm text-white rounded-md uppercase tracking-wider"
                                        >
                                            {getGenreName(genreId)}
                                        </span>
                                    ))}
                                </div>

                                {/* Title Overlay (Appears on Hover) */}
                                {/* Use || for TV show titles here too */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                                   <p className="text-sm font-semibold text-white line-clamp-1">{rec.title || rec.name}</p> 
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MovieDetail;