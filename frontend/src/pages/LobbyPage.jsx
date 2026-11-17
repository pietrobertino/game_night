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
import { QrCode } from "react-bootstrap-icons";
import QRCodePopup from "../components/QRCodePopup";
import { useLobby } from "../contexts/LobbyContext";

export default function LobbyPage() {

    const { setPopup, setAYSPopup } = useGlobal();
    const { lobbyCode, setLobbyCode, admin, setAdmin, currentGame, setShowQR } = useLobby();
    const { loading, user } = useAuth();

    const [enterLobby, setEnterLobby] = useState(false);
    const [err, setErr] = useState('');
    const navigate = useNavigate();

    //lista giocatori senza player in attesa e senza il proprio nome
    const [filteredPlayers, setFilteredPlayers] = useState([]);

    //le informazioni sull'utente
    const [loggedPlayer, setLoggedPlayer] = useState([]);

    //lista giocatori in attesa
    const [waitingPlayers, setWaitingPlayers] = useState([]);

    const currentUserId = user?.id;


    //funzioni della lobby
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

    // Carica la lista dei giocatori dal server (chiamata HTTP normale)
    const loadPlayers = () => {
        api.get(`/lobbys/${lobbyCode}/players`)
            .then(res => {
                //Lista giocatori in lobby tranne te
                setFilteredPlayers(res.data.filter(player => player.userId !== user.id && player.admission_status !== 'pending'));
                //Dati tuoi
                setLoggedPlayer(res.data.find(player => player.userId === user.id));
                //Lista giocatori in attesa
                setWaitingPlayers(res.data.filter(player => player.userId !== user.id && player.admission_status === 'pending'));
            })
    };

    useEffect(() => {

        if (lobbyCode) loadPlayers();

        const onChange = () => loadPlayers();

        socket.on('player_requested', onChange);
        socket.on('player_status_changed', onChange);
        socket.on('player_joined', onChange);
        socket.on('player_left', onChange);
        socket.on('admin_changed', onChange);
        socket.on('player_removed', onChange);

        return () => {
            socket.off('player_requested', onChange);
            socket.off('player_status_changed', onChange);
            socket.off('player_joined', onChange);
            socket.off('player_left', onChange);
            socket.off('admin_changed', onChange);
            socket.off('player_removed', onChange);
        };
    }, [lobbyCode, currentUserId]);

    return (
        <>
            <h1>Lobby Page</h1>
            <QRCodePopup />
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
                                    <button className=" btn btn-primary" onClick={() => setShowQR(true)}><QrCode /></button>
                                    <InviteButton />
                                </div>
                                {
                                    currentGame &&
                                    <h4>Gioco in corso: {currentGame}</h4>
                                }
                                <h4>Membri della lobby:</h4>
                                <LobbyList filteredPlayers={filteredPlayers} loggedPlayer={loggedPlayer} />
                                {
                                    (admin && waitingPlayers.length > 0) &&
                                    <>
                                        <h4>Giocatori in attesa:</h4>
                                        <WaitingList waitingPlayers={waitingPlayers} />
                                    </>
                                }
                                {
                                    admin ?
                                        <>
                                            <button onClick={() => setAYSPopup({ show: true, message: 'Sei sicuro di voler eliminare la lobby? ', action: () => deleteLobby() })} className=" btn btn-danger">Elimina lobby</button>
                                        </>
                                        :
                                        <>
                                            <button className=" btn btn-danger" onClick={() => setAYSPopup({ show: true, message: 'Sei sicuro di voler abbandonare la lobby? ', action: () => quitLobby() })}>Esci dalla lobby</button>
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