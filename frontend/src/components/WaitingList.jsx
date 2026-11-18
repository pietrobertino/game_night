import LobbyListItem from './LobbyListItem';
import { useApproval } from '../contexts/ApprovalContext';
import { usePopup } from '../contexts/PopupContext';
import { CheckLg, XLg } from 'react-bootstrap-icons';

export default function WaitingList({ waitingPlayers }) {

    const { setShowInvitePopup } = usePopup();
    const { acceptPlayer, deletePlayer } = useApproval();




    return (
        <ul className="player-list">
            {waitingPlayers.map(player => (
                <li key={player.userId} className='waiting-row'>
                    <LobbyListItem player={player} you={false} />
                    <button className="waiting-row__btn waiting-row__btn--accept" aria-label="Accetta" onClick={() => { acceptPlayer(player.userId); setShowInvitePopup(false) }}><CheckLg /></button>
                    <button className="waiting-row__btn waiting-row__btn--refuse" aria-label="Rifiuta" onClick={() => { deletePlayer(player.userId); setShowInvitePopup(false) }} ><XLg /></button>
                </li>
            ))}
        </ul>
    );
}

