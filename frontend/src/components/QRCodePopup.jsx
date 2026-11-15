import { QRCodeSVG } from "qrcode.react";
import { useLobby } from "../contexts/LobbyContext";

export default function QRCodePopup() {

    const { showQR, setShowQR, lobbyCode } = useLobby();
    const url = `https://game-night-sage-nine.vercel.app/join/${lobbyCode}`;

    return (
        <>
            {showQR &&
                <div>
                    <button className=" btn btn-close" onClick={() => setShowQR(false)}></button>
                    <QRCodeSVG
                        value={url}
                        size={200}
                        level="M"
                    />

                    <p>Scansiona per entrare!</p>
                </div>
            }
        </>
    )
}