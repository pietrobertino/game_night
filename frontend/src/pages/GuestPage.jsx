import { Link } from "react-router-dom"
import { useState } from "react"
import axios from 'axios';

export default function GuestPage() {

    const [nickname, setNickname] = useState('');

    const guestUrl = 'http://localhost:3001/accounts/create/guest';

    function handleForm(e) {
        e.preventDefault();
        axios.post(guestUrl, { nickname: nickname });
        setNickname('');
        //qui dovrei usare la navigazione programmatica per mandare l'utente o alla pagina di attesa (nel caso in sia stato invitato ad una lobby) o alla pagina home
    }

    return (
        <>
            {/* Devo validare il nickanem in modo che non sia una stringa vuota e abbia almeno tre lettere, fornendo appropriati avvisi quando ciò non viene rispettato*/}
            <form onSubmit={handleForm}>
                <label htmlFor="">Nickname:</label>
                <input type="text" onChange={e => setNickname(e.target.value)} value={nickname} />
                <button>Entra come guest</button>
            </form>
            {/* Questo non va bene, voglio cambiare e fare in modo che l'accesso si effettui tutto in una pagina mostrando componenti differenti sulla base di come l'utente vuole accedere */}
            <Link to='/access'>Ho un account</Link>
            <Link to='/registration'>Crea un account</Link>
        </>
    )
}