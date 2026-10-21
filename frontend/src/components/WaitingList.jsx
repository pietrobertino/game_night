import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import api from '../api';
import { useGlobal } from '../contexts/GlobalContext';
import { useAuth } from '../contexts/AuthContext';
import Loader from './Loader';
import LobbyListItem from './LobbyListItem';
import { useApproval } from '../contexts/ApprovalContext';

export default function WaitingList() {

    const { lobbyCode, setLobbyCode, admin, setPopup, showInvitePopup, setShowInvitePopup } = useGlobal();
    const { acceptPlayer, deletePlayer } = useApproval();
    const { user } = useAuth();
    const currentUserId = user.id;


    // lista dei giocatori in attesa
    const [waitingPlayers, setWaitingPlayers] = useState([]);


    const navigate = useNavigate();

    // Carica la lista dei giocatori dal server (chiamata HTTP normale)
    const loadPlayers = () => {
        api.get(`/lobbys/${lobbyCode}/players`)
            .then(res => {
                setWaitingPlayers(res.data.filter(player => player.userId !== user.id && player.admission_status === 'pending'));
            })
    };

    useEffect(() => {
        // Lista iniziale: gli eventi socket gestiscono solo i cambiamenti successivi
        loadPlayers();

        const onChange = () => loadPlayers();

        // L'admin ha espulso un giocatore.
        // Cosa fare: se sono io, esco dalla pagina; altrimenti lo tolgo dalla lista
        const onRemoved = ({ userId }) => {
            if (userId !== currentUserId) {
                loadPlayers();
            }
        };

        socket.on('player_requested', onChange);
        socket.on('player_joined', onChange);
        socket.on('player_left', onChange);
        socket.on('player_removed', onRemoved);

        // Pulizia: quando esci dalla pagina tolgo tutti gli ascolti
        return () => {
            socket.off('player_requested', onChange);
            socket.off('player_left', onChange);
            socket.off('player_joined', onChange);
            socket.off('player_removed', onRemoved);
        };
    }, [lobbyCode, currentUserId]);

    return (
        <ul>
            {waitingPlayers.map(player => (
                <div key={player.userId} className=' d-flex gap-3'>
                    <LobbyListItem player={player} you={false} />
                    <button className=' btn btn-success' onClick={() => { acceptPlayer(player.userId); setShowInvitePopup(false) }}> accetta</button>
                    <button className=' btn btn-danger' onClick={() => { deletePlayer(player.userId); setShowInvitePopup(false) }} >rifiuta</button>
                </div>
            ))}
        </ul>
    );
}

