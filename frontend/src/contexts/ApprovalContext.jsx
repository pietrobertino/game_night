import { createContext, useContext, useState, useEffect } from "react";
import api from "../api";
import { useGlobal } from "./GlobalContext";

const ApprovalContext = createContext();


export function ApprovalContextProvider({ children }) {

    const { lobbyCode } = useGlobal();

    function acceptPlayer(playerId) {
        console.log(lobbyCode, playerId)
        api.post(`/lobbys/${lobbyCode}/players/accept/${playerId}`)
            .then(res => console.log(res.data))
            .catch(err => { console.error(err); console.log(err.response.data) })
    }

    function deletePlayer(playerId) {
        api.delete(`/lobbys/${lobbyCode}/players/${playerId}`)
            .then(res => console.log(res.data))
            .catch(err => console.error(err))
    }


    return (
        <ApprovalContext.Provider value={{ acceptPlayer, deletePlayer }}>
            {children}
        </ApprovalContext.Provider>
    )
}

export function useApproval() {
    return useContext(ApprovalContext);
}