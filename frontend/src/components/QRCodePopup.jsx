import { QRCodeSVG } from "qrcode.react";
import { useLobby } from "../contexts/LobbyContext";
import baseUrl from "../url";

export default function QRCodePopup() {

    const { showQR, setShowQR, lobbyCode } = useLobby();
    const url = `${baseUrl.frontUrl}/join/${lobbyCode}`;

    return (
        <>
            {showQR &&
                <div className="popup popup__box popup__box--orange">
                    <button className=" popup__close" onClick={() => setShowQR(false)}>X</button>
                    <QRCodeSVG
                        value={url}
                        size={200}
                        level="M"
                        bgColor="#e8902a"
                    />

                    <p>Scansiona per entrare!</p>
                </div>
            }
        </>
    )
}