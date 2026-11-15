// src/socket.js
import { io } from 'socket.io-client';

export const socket = io('https://game-night-backend-1r2v.onrender.com/', {
    withCredentials: true, // manda il cookie session_token
    autoConnect: false     // ti connetti tu quando serve
});