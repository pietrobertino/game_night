import { createContext, useContext } from "react";

const AccessContext = createContext();

export function AccessContextProvider({ children }) {

    const

    return (
        <AccessContext.Provider value={{}}>
            {children}
        </AccessContext.Provider>
    )
}

export function useAccess() {
    return useContext(AccessContext);
}