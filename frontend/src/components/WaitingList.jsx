import LobbyListItem from './LobbyListItem';
import { useApproval } from '../contexts/ApprovalContext';
import { usePopup } from '../contexts/PopupContext';

export default function WaitingList({ waitingPlayers }) {

    const { setShowInvitePopup } = usePopup();
    const { acceptPlayer, deletePlayer } = useApproval();




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

