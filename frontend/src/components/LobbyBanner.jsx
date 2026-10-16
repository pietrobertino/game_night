import { useGlobal } from "../contexts/GlobalContext"

export default function LobbyBanner() {

    const { lobbyCode, admin } = useGlobal();

    return (
        <>
            {lobbyCode &&
                <>
                    {
                        admin ?

                            <h1>Host della lobby {lobbyCode}</h1 >
                            :
                            <h1>Membro della lobby {lobbyCode}</h1>
                    }

                </>
            }
        </>
    )
}