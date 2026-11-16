import axios from 'axios';

const api = axios.create({
    baseURL: 'https://game-night-backend-1r2v.onrender.com',
    withCredentials: true // il browser manda e salva il cookie session_token
});

export default api;