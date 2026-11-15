import { createContext, useContext, useState, useEffect } from "react";

const GlobalContext = createContext();

export function GlobalContextProvider({ children }) {


    const [accessType, setAccessType] = useState('guest');
    const [invited, setInvited] = useState(false);

    const [popup, setPopup] = useState('');
    const [AYSPopup, setAYSPopup] = useState({ show: false, message: '', action: () => { } });
    const [showInvitePopup, setShowInvitePopup] = useState(false);





    return (
        <GlobalContext.Provider value={{ accessType, setAccessType, invited, setInvited, popup, setPopup, AYSPopup, setAYSPopup, showInvitePopup, setShowInvitePopup }}>
            {children}
        </GlobalContext.Provider>
    )
}

export function useGlobal() {
    return useContext(GlobalContext);
}