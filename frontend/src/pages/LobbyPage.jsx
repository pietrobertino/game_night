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
import AreYouSurePopup from "../components/AreYouSurePopup";

export default function LobbyPage() {

    const { lobbyCode, setLobbyCode, setAdmin, admin, currentGame, setPopup, setAYSPopup } = useGlobal();
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

        const onRemoved = ({ userId }) => {
            if (userId === currentUserId) {
                setPopup('Sei stato rimosso dalla lobby');
                setLobbyCode('');
                navigate('/home');
                return;
            }
        };

        const onDeleted = () => {
            setPopup('La lobby è stata eliminata');
            setAdmin(false);
            setLobbyCode('');
            navigate('/home');
        };

        socket.on('player_removed', onRemoved);
        socket.on('lobby_deleted', onDeleted);

        return () => {
            socket.off('player_removed', onRemoved);
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
                                        <>
                                            <button onClick={() => setAYSPopup({ show: true, message: 'Sei sicuro di voler eliminare la lobby? ' })} className=" btn btn-danger">Elimina lobby</button>
                                            <AreYouSurePopup action={deleteLobby} />
                                        </>
                                        :
                                        <>
                                            <button className=" btn btn-danger" onClick={() => setAYSPopup({ show: true, message: 'Sei sicuro di voler abbandonare la lobby? ' })}>Esci dalla lobby</button>
                                            <AreYouSurePopup action={quitLobby} />
                                        </>
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