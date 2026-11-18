import { useEffect, useState } from "react"
import { usePopup } from "../contexts/PopupContext";

export default function GenericPopup() {

    const { popup, setPopup } = usePopup();

    const [show, setShow] = useState(false);

    useEffect(() => {
        if (!popup) return;
        setShow(true);
        setTimeout(() => {
            setShow(false);
            setPopup('');
        }, 3000);
    }, [popup])

    return (
        <>
            {show &&

                <div className=" d-flex justify-content-between ">
                    <h3>{popup}</h3>
                    <button className=" btn-close" onClick={() => setShow(false)}></button>
                </div >

            }
        </>
    )
}