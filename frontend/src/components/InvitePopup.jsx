import { useEffect, useState } from "react";
import { useGlobal } from "../contexts/GlobalContext"
import { socket } from "../socket";
import { useApproval } from "../contexts/ApprovalContext";

export default function InvitePopup() {

    const { admin } = useGlobal();
    const { acceptPlayer, deletePlayer } = useApproval();

    const [showPopup, setShowPopup] = useState(false);
    const [nickname, setNickname] = useState('');
    const [playerId, setPlayerId] = useState('');

    useEffect(() => {

        const onRequested = ({ userId, nickname }) => {
            setShowPopup(true);
            setNickname(nickname);
            setPlayerId(userId);
            setTimeout(() => {
                setShowPopup(false);
            }, 5000)
        };

        socket.on('player_requested', onRequested);

        return () => {
            socket.off('player_requested', onRequested);

        };
    }, [])


    return (
        <>
            {(admin && showPopup) &&
                <>
                    <h3 className=" text-danger">{nickname} vorrebbe entrare nella lobby.</h3>
                    <button className=" btn btn-primary" onClick={() => { acceptPlayer(playerId); setShowPopup(false) }}>Accetta</button>
                    <button className=" btn btn-danger" onClick={() => { deletePlayer(playerId); setShowPopup(false) }}>Rifiuta</button>
                    <button className=" btn btn-close" onClick={() => setShowPopup(false)}></button>
                </>
            }
        </>
    )
}