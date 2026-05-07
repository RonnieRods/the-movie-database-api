import { createContext, useState, useEffect, useContext } from "react";

const WatchlistContext = createContext();

export const WatchlistProvider = ({ children }) => {
   const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem("my_movie_watchlist");
    return saved ? JSON.parse(saved) : [];
   });

   useEffect(() => {
    localStorage.setItem("my_movie_watchlist", JSON.stringify(watchlist));
   }, [watchlist]);

   const toggleWatchlist = (movie) => {
    setWatchlist((prev) =>
        prev.find((m) => m.id === movie.id)
            ? prev.filter((m) => m.id !== movie.id)
            : [...prev, movie]
    );
   };

   return (
    <WatchlistContext.Provider value={{ watchlist, toggleWatchlist, setWatchlist}}>
        {children}
    </WatchlistContext.Provider>
   );
};

export const useWatchlist = () => useContext(WatchlistContext);