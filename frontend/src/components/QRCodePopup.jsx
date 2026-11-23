import { QRCodeSVG } from "qrcode.react";
import { useLobby } from "../contexts/LobbyContext";
import baseUrl from "../data/url";

export default function QRCodePopup() {

    const { showQR, setShowQR, lobbyCode } = useLobby();
    const url = `${baseUrl.frontUrl}/join/${lobbyCode}`;

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