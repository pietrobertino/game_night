import { useGlobal } from "../contexts/GlobalContext";
import LobbyList from "../components/LobbyList";
import api from "../api";
import { useState } from "react";
import EnterLobbyForm from "../components/EnterLobbyForm";

export default function LobbyPage() {

    const { lobbyCode, setLobbyCode } = useGlobal();
    const [enterLobby, setEnterLobby] = useState(false);

    const createLobbyUrl = '/lobbys';

    function createLobby() {
        api.post(createLobbyUrl)
            .then(res => {
                setLobbyCode(res.data.lobby_id);
            })
            .catch(err => {
                //messaggio di errore
            })
    }

    return (
        <>
            <h1>Lobby Page</h1>
            {enterLobby ?

                <>
                    <EnterLobbyForm />
                    <button onClick={() => setEnterLobby(false)}>
                        Annulla
                    </button>
                </>
                :

                lobbyCode ?
                    <LobbyList />
                    :
                    <>
                        <button onClick={createLobby}>
                            Crea Lobby
                        </button>
                        <button onClick={() => setEnterLobby(true)}>
                            Entra in una lobby
                        </button>
                    </>
            }
        </>
    )
}