import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const GlobalContext = createContext();

export function GlobalContextProvider({ children }) {

    const { user } = useAuth();

    const [accessType, setAccessType] = useState('guest');
    const [invited, setInvited] = useState(false);
    const [waiting, setWaiting] = useState(false);
    const [admin, setAdmin] = useState(false);
    const [lobbyCode, setLobbyCode] = useState('');
    const [currentGame, setCurrentGame] = useState('');
    const [popup, setPopup] = useState('');
    const [AYSPopup, setAYSPopup] = useState({ show: false, message: '' });
    const [showInvitePopup, setShowInvitePopup] = useState(false);


    useEffect(() => {
        if (user?.lobby_code) {
            //se sono dentro una lobby setto il lobby code giusto (al refresh è sempre presente)
            setLobbyCode(user.lobby_code);
            if (user.admin_id === user.id) setAdmin(true);
            // se non sono ancora stato accettato, riparte la schermata di attesa
            if (user.admission_status === 'pending') setWaiting(true);
        }
    }, [user]);

    return (
        <GlobalContext.Provider value={{ accessType, setAccessType, invited, setInvited, waiting, setWaiting, admin, setAdmin, lobbyCode, setLobbyCode, currentGame, setCurrentGame, popup, setPopup, AYSPopup, setAYSPopup, showInvitePopup, setShowInvitePopup }}>
            {children}
        </GlobalContext.Provider>
    )
}

export function useGlobal() {
    return useContext(GlobalContext);
}