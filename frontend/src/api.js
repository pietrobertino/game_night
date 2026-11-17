import axios from 'axios';

const api = axios.create({
    baseURL: 'https://api.game-night.eu',
    withCredentials: true // il browser manda e salva il cookie session_token
});

export default api;