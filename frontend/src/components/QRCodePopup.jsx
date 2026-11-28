import { QRCodeSVG } from "qrcode.react";
import { useLobby } from "../contexts/LobbyContext";
import baseUrl from "../data/url";

export default function QRCodePopup() {
    const { showQR, setShowQR, lobbyCode } = useLobby();
    const url = `${baseUrl.frontUrl}/join/${lobbyCode}`;

    if (!showQR) return null;

    return (
        <div className="popup" onClick={() => setShowQR(false)}>
            <div className="popup__box popup__box--orange qr-popup__box" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="popup__close" onClick={() => setShowQR(false)}>X</button>
                <QRCodeSVG value={url} size={200} level="M" bgColor="#e8902a" fgColor="#1c1e21" />
                <p className="qr-popup__text">Scansiona per entrare!</p>
            </div>
        </div>
    );
}