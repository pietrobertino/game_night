import { useGlobal } from "../contexts/GlobalContext";
import LobbyList from "../components/LobbyList";
import api from "../api";
import { useEffect, useState } from "react";
import EnterLobbyForm from "../components/EnterLobbyForm";
import { useAuth } from "../contexts/AuthContext";
import Loader from "../components/Loader";
import WaitingList from "../components/WaitingList";
import InviteButton from "../components/InviteButton";
import { socket } from "../socket";
import { useNavigate } from "react-router-dom";

export default function LobbyPage() {

    const { lobbyCode, setLobbyCode, setAdmin, admin, currentGame, setPopup } = useGlobal();
    const { loading } = useAuth();

    const [enterLobby, setEnterLobby] = useState(false);
    const [err, setErr] = useState('');
    const navigate = useNavigate();


    function createLobby() {
        api.post('/lobbys')
            .then(res => {
                setLobbyCode(res.data.lobby_code);
                setAdmin(true);
            })
            .catch(err => {
                setErr(err.data)
            })
    }

    function deleteLobby() {
        api.delete(`/lobbys/${lobbyCode}`)
    }

    function quitLobby() {
        api.delete(`/lobbys/${lobbyCode}/players`)
        setLobbyCode('');
        navigate('/home');
    }

    useEffect(() => {
        const onDeleted = () => {
            setPopup('La lobby è stata eliminata');
            setLobbyCode('');
            setAdmin(false);
            navigate('/home');
        };

        socket.on('lobby_deleted', onDeleted);

        return () => {
            socket.off('lobby_deleted', onDeleted);
        }
    }, [lobbyCode])

    return (
        <>
            <h1>Lobby Page</h1>
            {loading ?
                <Loader />
                :
                <>
                    {enterLobby ?

                        <>
                            <EnterLobbyForm />
                            <button onClick={() => setEnterLobby(false)}>
                                Annulla
                            </button>
                        </>
                        :

                        lobbyCode ?
                            <>
                                <div className=" d-flex justify-content-between">
                                    <h3>Codice lobby: {lobbyCode}</h3>
                                    <InviteButton />
                                </div>
                                {
                                    currentGame &&
                                    <h4>Gioco in corso: {currentGame}</h4>
                                }
                                <h4>Membri della lobby:</h4>
                                <LobbyList />
                                {
                                    admin &&
                                    <>
                                        <h4>Giocatori in attesa:</h4>
                                        <WaitingList />
                                    </>
                                }
                                {
                                    admin ?
                                        <button onClick={deleteLobby} className=" btn btn-danger">Elimina lobby</button>
                                        :
                                        <button className=" btn btn-danger" onClick={quitLobby}>Esci dalla lobby</button>
                                }
                            </>
                            :
                            <>
                                <button onClick={createLobby}>
                                    Crea Lobby
                                </button>
                                <button onClick={() => setEnterLobby(true)}>
                                    Entra in una lobby
                                </button>
                                {err && <span>Errore: {err}</span>}
                            </>
                    }
                </>
            }

        </>
    )
}