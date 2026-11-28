import { useEffect, useState } from "react";
import { usePopup } from "../contexts/PopupContext";
import { XLg } from "react-bootstrap-icons";

export default function GenericPopup() {
    const { popup, setPopup } = usePopup();
    const [show, setShow] = useState(false);

    function handleClose() {
        setShow(false);
        setPopup("");
    }

    useEffect(() => {
        if (!popup) return;

        setShow(true);

        const timer = setTimeout(() => {
            setShow(false);
            setPopup("");
        }, 3000);

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setShow(false);
                setPopup("");
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            clearTimeout(timer);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [popup, setPopup]);

    if (!show || !popup) return null;

    return (
        <div className="popup" role="dialog" aria-modal="true" onClick={handleClose} >
            <div className="popup__box generic-popup__box" onClick={(e) => e.stopPropagation()} >
                <h3 className="generic-popup__text">{popup}</h3>
                <button type="button" className="popup__close generic-popup__close" onClick={handleClose} aria-label="Chiudi" >
                    <XLg />
                </button>
            </div>
        </div>
    );
}