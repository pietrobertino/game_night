require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const initGameSocket = require('./sockets/gameSocket');
const gamesRouter = require('./routers/gamesRouter');
const lobbysRouter = require('./routers/lobbysRouter');
const accountsRouter = require('./routers/accountsRouter');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;

// Global Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

//Configurazione CORS per l'app
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

// Configurazione Socket.io
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    }
});
initGameSocket(io);

//Chiamate API
app.get('/', (req, res) => {
    res.send('Game night API');
})

app.use('/games', gamesRouter);

app.use('/lobbys', lobbysRouter);

app.use('/accounts', accountsRouter);


server.listen(PORT, () => {
    console.log(`Server principale avviato sulla porta ${PORT} 🚀`);
});
