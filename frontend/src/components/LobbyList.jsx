import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import api from '../api';
import { useGlobal } from '../contexts/GlobalContext';
import { useAuth } from '../contexts/AuthContext';
import LobbyListItem from './LobbyListItem';
import { Trash } from 'react-bootstrap-icons'
import { Award } from 'react-bootstrap-icons'
import { useApproval } from '../contexts/ApprovalContext';

// currentUserId: l'id dell'utente loggato (quello che ottieni dalla rotta /me)
export default function LobbyList() {

    const { lobbyCode, setLobbyCode, admin, setAdmin, setPopup, setAYSPopup } = useGlobal();
    const { deletePlayer } = useApproval();
    const { user } = useAuth();
    const currentUserId = user.id;

    //lista giocatori senza player in attesa e senza il proprio nome
    const [filteredPlayers, setFilteredPlayers] = useState([]);

    //le informazioni sull'utente
    const [loggedPlayer, setLoggedPlayer] = useState([]);

    const navigate = useNavigate();

    // Carica la lista dei giocatori dal server (chiamata HTTP normale)
    const loadPlayers = () => {
        api.get(`/lobbys/${lobbyCode}/players`)
            .then(res => {
                setFilteredPlayers(res.data.filter(player => player.userId !== user.id && player.admission_status !== 'pending'));
                setLoggedPlayer(res.data.find(player => player.userId === user.id));
            })
    };

    function makeAdmin(id) {
        api.patch(`/lobbys/${lobbyCode}/players/${id}`)
            .then(res => console.log(res.data))
            .catch(err => console.error(err))
    }

    useEffect(() => {
        // Lista iniziale: gli eventi socket gestiscono solo i cambiamenti successivi
        loadPlayers();

        //quando avviene uno degli eventi previsti del socket, aggiorno la lista dei giocatori con le nuove informazioni
        const onChange = () => loadPlayers();

        //quando cambia l'admin devo verificare se sono io quello nuovo per aggiornare la UI
        const onChangeAdmin = async ({ newAdminId, oldAdminId }) => {
            if (newAdminId === currentUserId) await setAdmin(true);
            if (oldAdminId === currentUserId) await setAdmin(false);
            loadPlayers()
        }



        // L'admin ha espulso un giocatore.
        // Cosa fare: se sono io, esco dalla pagina; altrimenti ricarico la lista
        const onRemoved = ({ userId }) => {
            if (userId === currentUserId) {
                setPopup('Sei stato rimosso dalla lobby');
                setLobbyCode('');
                navigate('/home');
                return;
            }
            loadPlayers();
        };

        socket.on('player_joined', onChange);
        socket.on('player_status_changed', onChange);
        socket.on('player_left', onChange);
        socket.on('player_removed', onRemoved);
        socket.on('admin_changed', onChangeAdmin);

        // Pulizia: quando esci dalla pagina tolgo tutti gli ascolti
        return () => {
            socket.off('player_joined', onChange);
            socket.off('player_status_changed', onChange);
            socket.off('player_left', onChange);
            socket.off('admin_changed', onChangeAdmin);
            socket.off('player_removed', onRemoved);
        };
    }, [lobbyCode, currentUserId]);

    return (
        <ul className='  list-unstyled'>
            {/* mostro sempre in cima il listitem del giocatore che sta guardando il sito */}
            <LobbyListItem player={loggedPlayer} you={true} />

            {admin ?
                <>
                    {filteredPlayers.map(player => (
                        <div key={player.userId} className=' d-flex justify-content-between'>
                            <LobbyListItem player={player} you={false} />
                            <button className=' btn btn-sm btn-primary' onClick={() => setAYSPopup({ show: true, message: `Sei sicuro di voler rendere ${player.nickname} il nuovo admin della lobby?`, action: () => { makeAdmin(player.userId); setPopup(`${player.nickname} è il nuovo admin della lobby`) } })}><Award /></button>
                            <button className=' btn btn-sm btn-danger' onClick={() => setAYSPopup({ show: true, message: `Vuoi davvero togliere il tuo bro ${player.nickname} dalla lobby?`, action: () => { deletePlayer(player.userId); setPopup(`${player.nickname} è stato cacciato dalla lobby`) } })}><Trash /></button>
                        </div>

                    ))}
                </>
                :
                <>
                    {filteredPlayers.map(player => (
                        <LobbyListItem key={player.userId} player={player} you={false} />
                    ))}
                </>
            }

        </ul>
    );
}

