import { usePopup } from "../contexts/PopupContext";
import { useEffect } from "react";

export default function AreYouSurePopup() {

    const { AYSPopup, setAYSPopup } = usePopup();

    const emptyPopup = { show: false, message: '', action: () => { } };

    const action = AYSPopup.action;

    useEffect(() => {
        if (!AYSPopup.show) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") setAYSPopup(emptyPopup);
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);

    }, [AYSPopup])

    return (
        <>
            {AYSPopup.show &&

                <div className="popup" role="dialog" aria-modal="true" onClick={() => setAYSPopup(emptyPopup)}>
                    <div className="popup__box confirm-popup__box" onClick={(e) => e.stopPropagation()}>
                        <p className="confirm-popup__message">{AYSPopup.message}</p>
                        <div className="confirm-popup__actions">
                            <button className="btn-pill btn-pill--red" onClick={() => { action(); setAYSPopup({ show: false, message: '', action: () => { } }) }}>Sì</button>
                            <button className="btn-pill btn-pill--light" onClick={() => setAYSPopup(emptyPopup)}>Annulla</button>
                        </div>
                    </div>
                </div >

            }
        </>
    )
}


