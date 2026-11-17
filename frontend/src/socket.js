// src/socket.js
import { io } from 'socket.io-client';

export const socket = io('https://api.game-night.eu', {
    withCredentials: true, // manda il cookie session_token
    autoConnect: false     // ti connetti tu quando serve
});