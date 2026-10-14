import CrownIcon from "../components/CrownIcon"

export default function LobbyPage() {

    //API call / socket per i dati della lobby
    const lobbyCode = ""
    const currentGame = ""
    const myId = null
    const adminId = null
    const players = []          // { user_id, nickname, connection_status: 'ONLINE' | 'OFFLINE' }
    const waitingPlayers = []   // { user_id, nickname }

    return (
        <main className="lobby-page">

            <section className="lobby-info">
                <p className="lobby-info__code">
                    Codice lobby <span>{lobbyCode}</span>
                </p>
                <button type="button" className="btn-pill btn-pill--orange">Invita</button>
            </section>

            <h2 className="lobby-page__title">
                Gioco in corso: <span>{currentGame}</span>
            </h2>

            <h2 className="lobby-page__title">Lobby</h2>
            <ul className="player-list">
                {players.map(player => (
                    <li key={player.user_id} className="player-row">
                        <span className={`player-row__status ${player.connection_status === 'ONLINE' ? 'is-online' : 'is-offline'}`}></span>

                        <span className="player-row__name">
                            {player.user_id === myId ? `TU (${player.nickname})` : player.nickname}
                        </span>

                        {/* corona piena = admin, corona vuota = passa il ruolo di admin */}
                        {player.user_id === adminId ? (
                            <span className="player-row__action"><CrownIcon filled /></span>
                        ) : (
                            <>
                                <button type="button" className="player-row__action" aria-label="Rendi admin">
                                    <CrownIcon />
                                </button>
                                <button type="button" className="player-row__action" aria-label="Rimuovi dalla lobby">
                                    <i className="bi bi-trash3"></i>
                                </button>
                            </>
                        )}
                    </li>
                ))}
            </ul>

            <hr className="lobby-page__divider" />

            <h2 className="lobby-page__title">Giocatori in attesa</h2>
            <ul className="player-list">
                {waitingPlayers.map(player => (
                    <li key={player.user_id} className="waiting-row">
                        <span className="waiting-row__name">{player.nickname}</span>
                        <button type="button" className="waiting-row__btn waiting-row__btn--accept" aria-label="Accetta">
                            <i className="bi bi-check-lg"></i>
                        </button>
                        <button type="button" className="waiting-row__btn waiting-row__btn--refuse" aria-label="Rifiuta">
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </li>
                ))}
            </ul>

            <button type="button" className="btn-pill btn-pill--red lobby-page__delete">Elimina lobby</button>
        </main>
    )
}
