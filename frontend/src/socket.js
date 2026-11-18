// src/socket.js
import { io } from 'socket.io-client';
import baseUrl from './url';

export const socket = io(`${baseUrl.backUrl}`, {
    withCredentials: true, // manda il cookie session_token
    autoConnect: false     // ti connetti tu quando serve
});