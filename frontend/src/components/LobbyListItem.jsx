export default function LobbyListItem({ you, player }) {

    return (
        <li>
            {you ?
                <span>TU ({player.nickname}) {player.connection_status} {player.player_role === 'admin' && <>- <i>corona</i></>}</span>
                :
                <span>{player.nickname} {player.connection_status} {player.player_role === 'admin' && <>- <i>corona</i></>}</span>
            }


        </li>
    )
}