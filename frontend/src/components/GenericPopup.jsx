import { useEffect, useState } from "react"
import { useGlobal } from "../contexts/GlobalContext";

export default function GenericPopup() {

    const { popup, setPopup } = useGlobal();

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