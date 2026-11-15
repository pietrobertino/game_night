import { useGlobal } from "../contexts/GlobalContext";

export default function AreYouSurePopup() {

    const { AYSPopup, setAYSPopup } = useGlobal();

    const action = AYSPopup.action;

    return (
        <>
            {AYSPopup.show &&

                <div className=" d-flex justify-content-between ">
                    <h3>{AYSPopup.message}</h3>
                    <button className=" btn btn-danger " onClick={() => { action(); setAYSPopup({ show: false, message: '', action: () => { } }) }}>Sì</button>
                    <button className="btn btn-secondary" onClick={() => setAYSPopup({ show: false, message: '', action: () => { } })}>Annulla</button>
                </div >

            }
        </>
    )
}
