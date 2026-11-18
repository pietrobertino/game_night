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
import { usePopup } from "../contexts/PopupContext";

export default function LobbyPage() {

    const { setAYSPopup } = usePopup();
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


    // //API call / socket per i dati della lobby
    // const lobbyCode = ""
    // const currentGame = ""
    // const myId = null
    // const adminId = null
    // const players = []          // { user_id, nickname, connection_status: 'ONLINE' | 'OFFLINE' }
    // const waitingPlayers = []   // { user_id, nickname }


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
        <div className=" lobby-page">
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
                                <div className=" d-flex justify-content-between lobby-info">
                                    <p className="lobby-info__code">
                                        Codice lobby: <span>{lobbyCode}</span>
                                    </p>
                                    <button className=" btn btn-primary" onClick={() => setShowQR(true)}><QrCode /></button>
                                    <button type="button" className="btn-pill btn-pill--orange">Invita</button>
                                    <InviteButton />
                                </div>

                                {
                                    currentGame &&
                                    <h2 className="lobby-page__title">
                                        Gioco in corso: <span>{currentGame}</span>
                                    </h2>
                                }
                                <h4>Membri della lobby:</h4>
                                <h2 className="lobby-page__title">Lobby</h2>
                                <LobbyList filteredPlayers={filteredPlayers} loggedPlayer={loggedPlayer} />
                                {
                                    (admin && waitingPlayers.length > 0) &&
                                    <>
                                        <hr className="lobby-page__divider" />
                                        <h2 className="lobby-page__title">Giocatori in attesa</h2>
                                        <WaitingList waitingPlayers={waitingPlayers} />
                                    </>
                                }
                                {
                                    admin ?
                                        <>
                                            <button onClick={() => setAYSPopup({ show: true, message: 'Sei sicuro di voler eliminare la lobby? ', action: () => deleteLobby() })} className="btn-pill btn-pill--red lobby-page__delete">Elimina lobby</button>
                                        </>
                                        :
                                        <>
                                            <button className="btn-pill btn-pill--red lobby-page__delete" onClick={() => setAYSPopup({ show: true, message: 'Sei sicuro di voler abbandonare la lobby? ', action: () => quitLobby() })}>Esci dalla lobby</button>
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

        </div>

    )
}
