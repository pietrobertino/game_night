import { useEffect, useState } from "react";
import { socket } from "../socket";
import { useApproval } from "../contexts/ApprovalContext";
import { useLobby } from "../contexts/LobbyContext";
import { usePopup } from "../contexts/PopupContext";

export default function InvitePopup() {
    const { showInvitePopup, setShowInvitePopup } = usePopup();
    const { admin } = useLobby();
    const { acceptPlayer, deletePlayer } = useApproval();

    const [nickname, setNickname] = useState("");
    const [playerId, setPlayerId] = useState("");

    useEffect(() => {
        let timer;

        const onRequested = ({ userId, nickname }) => {
            setShowInvitePopup(true);
            setNickname(nickname);
            setPlayerId(userId);
            clearTimeout(timer);
            timer = setTimeout(() => {
                setShowInvitePopup(false);
            }, 5000);
        };

        socket.on("player_requested", onRequested);

        return () => {
            clearTimeout(timer);
            socket.off("player_requested", onRequested);
        };
    }, [setShowInvitePopup]);

    if (!admin || !showInvitePopup) return null;

    return (
        <div className="popup" onClick={() => setShowInvitePopup(false)}>
            <div className="popup__box invite-popup__box" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="popup__close" onClick={() => setShowInvitePopup(false)}>X</button>
                <h3 className="invite-popup__message"><span>{nickname}</span> vorrebbe entrare nella lobby.</h3>
                <div className="invite-popup__actions">
                    <button type="button" className="btn-pill btn-pill--red" onClick={() => { deletePlayer(playerId); setShowInvitePopup(false); }}>Rifiuta</button>
                    <button type="button" className="btn-pill btn-pill--green" onClick={() => { acceptPlayer(playerId); setShowInvitePopup(false); }}>Accetta</button>
                </div>
            </div>
        </div>
    );
}