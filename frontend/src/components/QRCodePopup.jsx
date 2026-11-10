import { useGlobal } from "../contexts/GlobalContext";
import { QRCodeSVG } from "qrcode.react";

export default function QRCodePopup() {

    const { showQR, setShowQR, lobbyCode } = useGlobal();
    const url = `https://localhost:5173/join/${lobbyCode}`;

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