// components/LobbySocketListener.jsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { socket } from "../socket";
import { useAuth } from "../contexts/AuthContext";
import { useGlobal } from "../contexts/GlobalContext";
import { useLobby } from "../contexts/LobbyContext";

export default function LobbySocketListener() {

    const { user, loading, waiting, setWaiting } = useAuth();
    const { setPopup } = useGlobal();
    const { lobbyCode, setLobbyCode, setAdmin } = useLobby();

    const navigate = useNavigate();
    const location = useLocation();

    const currentUserId = user?.id;

    //all'avvio ripristino la lobby dai dati di /accounts/me (una sola volta)
    useEffect(() => {
        if (loading || !user?.lobby_code) return;
        setLobbyCode(user.lobby_code);
        setAdmin(user.admin_id === user.id);
    }, [loading]);

    //finché sono in attesa, non posso stare su nessun'altra pagina
    useEffect(() => {
        const onWaitingPage = location.pathname === '/' || location.pathname.startsWith('/join');
        if (waiting && !onWaitingPage) {
            navigate('/', { replace: true });
        }
    }, [waiting, location.pathname]);


    //useEffect per gli eventi socket della lobby
    useEffect(() => {
        // senza lobby non c'è niente da ascoltare
        if (!lobbyCode) return;

        const onChangeAdmin = ({ newAdminId, oldAdminId, newAdminNickname }) => {
            if (newAdminId === currentUserId) {
                setPopup('Sei il nuovo admin della lobby');
                setAdmin(true);
            } else {
                setPopup(`${newAdminNickname} è il nuovo admin della lobby`);
                if (oldAdminId === currentUserId) setAdmin(false);
            }
        };

        const onPlayerJoined = ({ userId }) => {
            if (userId === currentUserId) {
                setPopup('Sei stato accettato in lobby brother');
                setWaiting(false);
                navigate('/home');
            }
        };

        const onRemoved = ({ userId, userNickname }) => {
            if (userId === currentUserId) {
                setPopup('Sei stato rimosso dalla lobby');
                setLobbyCode('');
                navigate('/home');
            } else {
                setPopup(`${userNickname} è stato cacciato dalla lobby`);
            }
        };

        const onPlayerLeft = ({ userNickname }) => {
            setPopup(`${userNickname} ha abbandonato la lobby`);
        };

        const onDeleted = () => {
            setPopup('La lobby è stata eliminata');
            setWaiting(false);
            setAdmin(false);
            setLobbyCode('');
            navigate('/home');
        };

        socket.on('admin_changed', onChangeAdmin);
        socket.on('player_joined', onPlayerJoined);
        socket.on('player_removed', onRemoved);
        socket.on('player_left', onPlayerLeft);
        socket.on('lobby_deleted', onDeleted);

        return () => {
            socket.off('admin_changed', onChangeAdmin);
            socket.off('player_joined', onPlayerJoined);
            socket.off('player_removed', onRemoved);
            socket.off('player_left', onPlayerLeft);
            socket.off('lobby_deleted', onDeleted);
        };
    }, [lobbyCode, currentUserId]);

    return null; // non mostra niente
}