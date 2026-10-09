import { useState } from "react";
import axios from 'axios'

export default function GuestForm() {

    const [nickname, setNickname] = useState('');

    const guestUrl = 'http://localhost:3001/accounts/create/guest';

    function handleForm(e) {
        e.preventDefault();
        axios.post(guestUrl, { nickname: nickname })
            .catch(err => {
                console.error(err);
            });
        setNickname('');
        //qui dovrei usare la navigazione programmatica per mandare l'utente o alla pagina di attesa (nel caso in sia stato invitato ad una lobby) o alla pagina home
    }

    //devo fare in modo di validare il nickname in modo che abbia almeno tre lettere (tra l'altro dovrei eseguire la validazione anche lato backend)

    return (
        <form onSubmit={handleForm}>
            <label htmlFor="nickname">Nickname:</label>
            <input type="text" id="nickname" value={nickname} onChange={e => setNickname(e.target.value)} />
            <button type="submit">Entra come guest</button>
        </form>
    )
}