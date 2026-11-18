import { createContext, useContext, useState } from "react";

const PopupContext = createContext();

export function PopupContextProvider({ children }) {

    const [popup, setPopup] = useState('');
    const [AYSPopup, setAYSPopup] = useState({ show: false, message: '', action: () => { } });
    const [showInvitePopup, setShowInvitePopup] = useState(false);


    return (
        <PopupContext.Provider value={{ popup, setPopup, AYSPopup, setAYSPopup, showInvitePopup, setShowInvitePopup }}>
            {children}
        </PopupContext.Provider>
    )
}

export function usePopup() {
    return useContext(PopupContext);
}