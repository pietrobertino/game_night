import { useEffect, useState } from "react";
import { useGlobal } from "../contexts/GlobalContext"
import { socket } from "../socket";
import { useApproval } from "../contexts/ApprovalContext";

export default function InvitePopup() {

    const { admin, showInvitePopup, setShowInvitePopup } = useGlobal();
    const { acceptPlayer, deletePlayer } = useApproval();

    const [nickname, setNickname] = useState('');
    const [playerId, setPlayerId] = useState('');

    useEffect(() => {

        const onRequested = ({ userId, nickname }) => {
            setShowInvitePopup(true);
            setNickname(nickname);
            setPlayerId(userId);
            setTimeout(() => {
                setShowInvitePopup(false);
            }, 5000)
        };

        socket.on('player_requested', onRequested);

        return () => {
            socket.off('player_requested', onRequested);

        };
    }, [])


    return (
        <>
            {(admin && showInvitePopup) &&
                <>
                    <h3 className=" text-danger">{nickname} vorrebbe entrare nella lobby.</h3>
                    <button className=" btn btn-primary" onClick={() => { acceptPlayer(playerId); setShowInvitePopup(false) }}>Accetta</button>
                    <button className=" btn btn-danger" onClick={() => { deletePlayer(playerId); setShowInvitePopup(false) }}>Rifiuta</button>
                    <button className=" btn btn-close" onClick={() => setShowInvitePopup(false)}></button>
                </>
            }
        </>
    )
}