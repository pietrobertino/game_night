require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const initGameSocket = require('./sockets/gameSocket');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;

// Global Middlewares
app.use(express.json());
app.use(cookieParser());

// Configurazione Socket.io
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Cambia con l'URL del tuo client frontend
        credentials: true
    }
});

// Inizializza il modulo dei Sockets passando l'istanza 'io'
initGameSocket(io);

// Spazio per le future rotte API HTTP (Controllers)
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/lobby', require('./routes/lobbyRoutes'));

server.listen(PORT, () => {
    console.log(`Server principale avviato sulla porta ${PORT} 🚀`);
});
