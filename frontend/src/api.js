import axios from 'axios';
import baseUrl from './url';

const api = axios.create({
    baseURL: `${baseUrl.backUrl}`,
    withCredentials: true // il browser manda e salva il cookie session_token
});

export default api;