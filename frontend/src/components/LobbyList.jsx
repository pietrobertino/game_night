import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';

// lobbyCode: il codice della lobby (dall'URL)
// currentUserId: l'id dell'utente loggato (quello che ottieni dalla rotta /me)
export default function LobbyList({ lobbyCode, currentUserId }) {
    const [players, setPlayers] = useState([]);
    const navigate = useNavigate();

    // Carica la lista dei giocatori dal server (chiamata HTTP normale)
    const loadPlayers = () => {
        axios.get(`http://localhost:3000/lobbys/${lobbyCode}/players`, { withCredentials: true })
            .then(res => res.json())
            .then(data => setPlayers(data));
    };

    useEffect(() => {
        // Lista iniziale: gli eventi socket gestiscono solo i cambiamenti successivi
        loadPlayers();

        // Un giocatore ha chiesto di entrare (lo ricevi solo se sei già nella stanza, cioè admin o ammesso).
        // Cosa fare: aggiungerlo alla lista come "pending"
        const onRequested = ({ userId, nickname }) => {
            setPlayers(prev => [...prev, { userId, nickname, admission_status: 'pending', connection_status: 'ONLINE' }]);
        };

        // Un giocatore è stato accettato dall'admin.
        // Cosa fare: se sono io, ricarico tutta la lista (finora non ero nella stanza e non ho visto nulla);
        // altrimenti segno quel giocatore come "admitted"
        const onJoined = ({ userId, nickname }) => {
            if (userId === currentUserId) {
                loadPlayers();
                return;
            }
            setPlayers(prev => {
                const exists = prev.some(p => p.userId === userId);
                if (exists) {
                    return prev.map(p => (p.userId === userId ? { ...p, admission_status: 'admitted' } : p));
                }
                return [...prev, { userId, nickname, admission_status: 'admitted', connection_status: 'ONLINE' }];
            });
        };

        // Un giocatore è andato ONLINE o OFFLINE (refresh, chiusura scheda, rete).
        // Cosa fare: cambiare solo il suo connection_status
        const onStatus = ({ userId, status }) => {
            setPlayers(prev => prev.map(p => (p.userId === userId ? { ...p, connection_status: status } : p)));
        };

        // Un giocatore è uscito volontariamente.
        // Cosa fare: toglierlo dalla lista
        const onLeft = ({ userId }) => {
            setPlayers(prev => prev.filter(p => p.userId !== userId));
        };

        // L'admin ha espulso un giocatore.
        // Cosa fare: se sono io, esco dalla pagina; altrimenti lo tolgo dalla lista
        const onRemoved = ({ userId }) => {
            if (userId === currentUserId) {
                alert('Sei stato rimosso dalla lobby');
                navigate('/');
                return;
            }
            setPlayers(prev => prev.filter(p => p.userId !== userId));
        };

        // L'admin ha eliminato la lobby.
        // Cosa fare: riportare tutti alla home
        const onDeleted = () => {
            alert('La lobby è stata eliminata');
            navigate('/');
        };

        socket.on('player_requested', onRequested);
        socket.on('player_joined', onJoined);
        socket.on('player_status_changed', onStatus);
        socket.on('player_left', onLeft);
        socket.on('player_removed', onRemoved);
        socket.on('lobby_deleted', onDeleted);

        // Pulizia: quando esci dalla pagina tolgo tutti gli ascolti
        return () => {
            socket.off('player_requested', onRequested);
            socket.off('player_joined', onJoined);
            socket.off('player_status_changed', onStatus);
            socket.off('player_left', onLeft);
            socket.off('player_removed', onRemoved);
            socket.off('lobby_deleted', onDeleted);
        };
    }, [lobbyCode, currentUserId]);

    return (
        <ul>
            {players.map(p => (
                <li key={p.userId}>
                    {p.nickname} - {p.admission_status} - {p.connection_status}
                </li>
            ))}
        </ul>
    );
}

