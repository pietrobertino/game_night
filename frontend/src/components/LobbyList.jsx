import api from '../api';
import LobbyListItem from './LobbyListItem';
import { Trash } from 'react-bootstrap-icons'
import { useApproval } from '../contexts/ApprovalContext';
import { useLobby } from '../contexts/LobbyContext';
import { usePopup } from '../contexts/PopupContext';
import CrownIcon from './CrownIcon';

// currentUserId: l'id dell'utente loggato (quello che ottieni dalla rotta /me)
export default function LobbyList({ filteredPlayers, loggedPlayer }) {

    const { setPopup, setAYSPopup } = usePopup();
    const { lobbyCode, admin } = useLobby();
    const { deletePlayer } = useApproval();


    function makeAdmin(id) {
        api.patch(`/lobbys/${lobbyCode}/players/${id}`)
            .then(res => console.log(res.data))
            .catch(err => console.error(err))
    }

    return (
        <ul className='  list-unstyled player-list'>
            {/* mostro sempre in cima il listitem del giocatore che sta guardando il sito */}
            <LobbyListItem player={loggedPlayer} you={true} />

            {admin ?
                <>
                    {filteredPlayers.map(player => (
                        <div key={player.userId} className=' d-flex justify-content-between'>
                            <LobbyListItem player={player} you={false} />
                            <button className="player-row__action" aria-label="Rendi admin" onClick={() => setAYSPopup({ show: true, message: `Sei sicuro di voler rendere ${player.nickname} il nuovo admin della lobby?`, action: () => { makeAdmin(player.userId) } })}><CrownIcon /></button>
                            <button className="player-row__action" aria-label="Rimuovi dalla lobby" onClick={() => setAYSPopup({ show: true, message: `Vuoi davvero togliere il tuo bro ${player.nickname} dalla lobby?`, action: () => { deletePlayer(player.userId) } })}><Trash /></button>
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

