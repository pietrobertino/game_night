import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3001',
    withCredentials: true // il browser manda e salva il cookie session_token
});

export default api;