import { use, useEffect, useState } from "react"
import { useGlobal } from "../contexts/GlobalContext";

export default function AreYouSurePopup({ action }) {

    const { AYSPopup, setAYSPopup } = useGlobal();

    return (
        <>
            {AYSPopup.show &&

                <div className=" d-flex justify-content-between ">
                    <h3>{AYSPopup.message}</h3>
                    <button className=" btn btn-danger " onClick={() => { action(); setAYSPopup({ show: false, message: '' }) }}>Sì</button>
                    <button className="btn btn-secondary" onClick={() => setAYSPopup({ show: false, message: '' })}>Annulla</button>
                </div >

            }
        </>
    )
}
