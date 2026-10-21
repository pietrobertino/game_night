import { useGlobal } from "../contexts/GlobalContext"

export default function LobbyBanner() {

    const { lobbyCode, admin } = useGlobal();

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