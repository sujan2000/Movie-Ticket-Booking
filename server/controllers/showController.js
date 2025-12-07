import axios from "axios"

export const getNowPlayingMovies = async (res, req) => {
    try {
        await axios.get('https://api.themoviedb.org/3/movie/now_playing', {
            headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
        })
    } catch (error) {

    }
}