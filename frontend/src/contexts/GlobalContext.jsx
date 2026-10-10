import { createContext, useContext, useState } from "react";

const GlobalContext = createContext();

export function GlobalContextProvider({ children }) {

    const [accessType, setAccessType] = useState('guest');
    const [invited, setInvited] = useState(false);
    const [waiting, setWaiting] = useState(false);
    const [admin, setAdmin] = useState(false);

    return (
        <GlobalContext.Provider value={{ accessType, setAccessType, invited, setInvited, waiting, setWaiting, admin, setAdmin }}>
            {children}
        </GlobalContext.Provider>
    )
}

export function useGlobal() {
    return useContext(GlobalContext);
}