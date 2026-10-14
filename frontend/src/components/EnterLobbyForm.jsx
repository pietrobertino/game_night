import { useState } from "react"
import { useNavigate } from "react-router-dom";

export default function EnterLobbyForm() {

    const [code, setCode] = useState('');
    const navigate = useNavigate();

    function handleForm(e) {
        e.preventDefault();
        //vengo reinviato alla pagina di accesso con un codice della lobby (ma non ripeto l'iter di accesso grazie ai cookie), quindi dovrei arrivare direttamente alla pagina di attesa
        navigate(`/join/${code}`);
    }

    //necessario validare il codice della lobby inserito in modo che contenga solo i caratteri giusti e che siano esattamente sei

    return (
        <form onSubmit={handleForm}>
            <label htmlFor="codeInput">Codice della lobby:</label>
            <input type="text" name="codeInput" id="codeInput" placeholder="123ABC" onChange={e => setCode(e.target.value)} value={code} />
            <button>Chiedi di entrare</button>
        </form>
    )
}