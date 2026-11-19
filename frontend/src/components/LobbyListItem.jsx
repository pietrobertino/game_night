import CrownIcon from "./CrownIcon"

export default function LobbyListItem({ you, player }) {

    return (
        <li className="player-row">

            {player.player_role === 'admin' && <span className="player-row__action"><CrownIcon filled /></span>}

            <span className="player-row__name">{you ? `TU (${player.nickname})` : `${player.nickname}`}</span>
            <span className={`player-row__status ${player.connection_status === 'ONLINE' ? 'is-online' : 'is-offline'}`}></span>


        </li>
    )
}


