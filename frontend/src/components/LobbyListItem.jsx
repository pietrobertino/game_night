import { AwardFill } from "react-bootstrap-icons"

export default function LobbyListItem({ you, player }) {

    return (
        <li>
            {you ?
                <span>{player.player_role === 'admin' && <AwardFill />} TU ({player.nickname}) {player.connection_status} </span>
                :
                <span>{player.player_role === 'admin' && <AwardFill />} {player.nickname} {player.connection_status} </span>
            }


        </li>
    )
}