import { QRCodeSVG } from "qrcode.react";
import { useLobby } from "../contexts/LobbyContext";

export default function QRCodePopup() {

    const { showQR, setShowQR, lobbyCode } = useLobby();
    const url = `https://app.game-night.eu/join/${lobbyCode}`;

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