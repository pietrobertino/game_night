import { useLobby } from "../contexts/LobbyContext"

export default function LobbyBanner() {

    const { lobbyCode, admin } = useLobby();

    return (
        <>
            {lobbyCode &&
                <>
                    {
                        admin ?

                            <h4 className=" text-warning">Host della lobby {lobbyCode}</h4 >
                            :
                            <h4 className=" text-warning">Membro della lobby {lobbyCode}</h4>
                    }

                </>
            }
        </>
    )
}