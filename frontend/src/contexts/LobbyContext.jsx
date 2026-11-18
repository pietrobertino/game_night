import { useAuth } from "./AuthContext";
import { useState, useEffect } from "react";
import { createContext, useContext } from "react";

const LobbyContext = createContext();

export function LobbyContextProvider({ children }) {

    const { user, setWaiting } = useAuth();

    const [admin, setAdmin] = useState(false);
    const [lobbyCode, setLobbyCode] = useState('');
    const [currentGame, setCurrentGame] = useState('');
    const [showQR, setShowQR] = useState(false);

    useEffect(() => {
        if (user?.lobby_code && user?.admission_status === 'admitted') {
            //se sono dentro una lobby setto il lobby code giusto (al refresh è sempre presente)
            setLobbyCode(user.lobby_code);
            if (user.admin_id === user.id) setAdmin(true);
        }
        // se non sono ancora stato accettato, riparte la schermata di attesa
        if (user?.admission_status === 'pending') setWaiting(true);
    }, [user]);

    return (
        <LobbyContext.Provider value={{ admin, setAdmin, lobbyCode, setLobbyCode, currentGame, setCurrentGame, showQR, setShowQR }}>
            {children}
        </LobbyContext.Provider>
    )
}

export function useLobby() {
    return useContext(LobbyContext);
}