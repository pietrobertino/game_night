import { createContext, useContext, useState } from "react";

const AccessContext = createContext();

export function AccessContextProvider({ children }) {


    const [accessType, setAccessType] = useState('guest');
    const [invited, setInvited] = useState(false);

    return (
        <AccessContext.Provider value={{ accessType, setAccessType, invited, setInvited }}>
            {children}
        </AccessContext.Provider>
    )
}

export function useAccess() {
    return useContext(AccessContext);
}