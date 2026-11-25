import { useLobby } from "../contexts/LobbyContext"

export default function LobbyBanner() {

    const { lobbyCode, admin } = useLobby();

    return (
        <>
            {lobbyCode &&
                <div className="lobby-info">
                    {
                        admin ?

                            <h4 className="lobby-info__code">Host della lobby <span>{lobbyCode}</span></h4 >
                            :
                            <h4 className="lobby-info__code">Membro della lobby <span>{lobbyCode}</span></h4>
                    }

                </div>
            }
        </>
    )
}