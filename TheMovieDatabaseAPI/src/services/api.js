import axios from 'axios';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const api = axios.create({
    baseURL: "https://api.themoviedb.org/3",
    params: {
        api_key: API_KEY,
    },
});

export const getPopularMovies = async (page = 1) => {
    const response =  await api.get("/movie/popular", { params: { page } });
    return response.data.results;
};

export const searchMovies = async (query, page = 1) => {
    const response = await api.get("/search/movie", {
        params: { query, page }
    });
    return response.data.results;
};

// Fetch the list of genres (Action: 28, Comedy : 35, etc.)
export const getGenres = async () => {
    const response = await api.get("/genre/movie/list");
    return response.data.genres;
};

// Discover movies matching a specific genre ID
export const getMoviesByGenre = async (genreId, page = 1) => {
    const response = await api.get("/discover/movie", {
        params: { with_genres: genreId, page },
    });
    return response.data.results;
};