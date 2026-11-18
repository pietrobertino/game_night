import { useState } from "react"
import { useNavigate } from "react-router-dom";
import api from "../api";


export default function EnterLobbyForm() {

    const [code, setCode] = useState('');
    const navigate = useNavigate();

    //variabili per validare il codice lobby inserito
    const [touched, setTouched] = useState(false);
    const valid = code.length === 6;
    const showErr = !valid && touched;

    //variabile per lobby inesistente
    const [lobbyErr, setLobbyErr] = useState(false);

    //valido l'input del codice lobby
    function handleChange(e) {
        const valorePulito = e.target.value
            .replace(/[^a-zA-Z0-9]/g, '') // 1. Rimuove simboli e spazi
            .toUpperCase();               // 2. Converte tutto in maiuscolo

        setCode(valorePulito);
    }

    function handleForm(e) {
        e.preventDefault();
        //verifico che la lobby esista, altrimenti messaggio di errore
        api.get(`/lobbys/${code}`)
            .then(() => {
                navigate(`/join/${code}`);
            })
            .catch(err => {
                if (err.response?.status === 404) setLobbyErr(true);
            })
    }

    return (
        <form onSubmit={handleForm}>
            <label htmlFor="codeInput">Codice della lobby:</label>
            <input type="text" name="codeInput" id="codeInput" maxLength={6} placeholder="123ABC" onBlur={() => setTouched(true)} onClick={() => { setTouched(false), setLobbyErr(false) }} onChange={handleChange} value={code} />
            <button>Chiedi di entrare</button>
            {
                showErr && <div className=" text-danger">Codice lobby non valido: Deve essere di 6 caratteri </div>
            }
            {
                lobbyErr && <div className=" text-danger">La lobby {code} non esiste</div>
            }
        </form>
    )
}