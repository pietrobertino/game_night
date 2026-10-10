import { useState } from "react"
import axios from "axios"
import { useGlobal } from "../contexts/GlobalContext"
import { useNavigate } from "react-router-dom";

export default function AccessForm() {

    const { invited, setWaiting, accessType } = useGlobal();
    const navigate = useNavigate();

    const initialData = { email: '', password: '' }
    const [nickname, setNickname] = useState('');
    const [formData, setFormData] = useState(initialData);
    const [showPassword, setShowPassword] = useState(false);


    //variabili per validare l'input del nickname
    const [nickTouched, setNickTouched] = useState(false); //all'inizio il campo input non è toccato
    const nickValid = nickname.trim().length >= 3 && nickname.trim().length <= 15;
    const showNickErr = !nickValid && nickTouched;

    //variabili per validare mail

    //variabili per validare password

    //url per le chiamate axios
    const guestUrl = 'http://localhost:3001/accounts/create/guest';
    const loginUrl = 'http://localhost:3001/accounts';
    const registrationUrl = 'http://localhost:3001/accounts/create/registration';

    function handleForm(e) {
        e.preventDefault();

        switch (accessType) {
            case 'guest':
                if (!nickValid) return
                axios.post(guestUrl, { nickname: nickname })
                    .catch(err => {
                        console.error(err);
                    });
                //se l'utente è stato invitato ad una lobby (non sta accedendo direttamente al sito)
                if (invited) {
                    //viene mandato alla pagina di accesso con la schermata di attesa
                    navigate('/');
                    setWaiting(true);
                    //qui dovrei inserire la logica che manda la richiesta di accesso all'admin della lobby
                } else {
                    //altrimenti viene mandato alla home
                    navigate('/home');
                }
                break;

            case 'login':
                axios.post(loginUrl, { mail: formData.email, password: formData.password })
                    .then(response => {
                        console.log(response.data)
                    })
                    .catch(err => {
                        console.error(err);
                    });
                setFormData(initialData);
                //Verifico che l'accesso sia garantito e poi mando il giocatore alla schermata giusta
                //qui dovrei usare la navigazione programmatica per mandare l'utente o alla pagina di attesa (nel caso in sia stato invitato ad una lobby) o alla pagina home
                break;

            case 'registration':
                axios.post(registrationUrl, { mail: formData.email, password: formData.password, nickname: nickname })
                    .then(response => {
                        console.log(response.data.message)
                    })
                    .catch(error => {
                        console.error(error.response?.data?.message);
                    });
                setFormData(initialData);
                //Verifico che la registrazione sia riuscita e poi mando il giocatore alla schermata giusta. Gestire casi in cui la registrazione non va a buon fine (hai già un account, oppure problemi con la mail, il nickname o la passowrd)
                //qui dovrei usare la navigazione programmatica per mandare l'utente o alla pagina di attesa (nel caso in sia stato invitato ad una lobby) o alla pagina home
                break;
        }
    }

    return (
        <form onSubmit={handleForm}>
            {
                (accessType === 'guest' || accessType === 'registration') &&
                <>
                    <label htmlFor="nickname">Nickname:</label>
                    <input type="text" id="nickname" value={nickname} onChange={e => setNickname(e.target.value)} onBlur={() => setNickTouched(true)} />
                    {showNickErr && <span>Nickname non valido</span>}
                </>
            }
            {
                (accessType === 'login' || accessType === 'registration') &&
                <>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    <label htmlFor="password">Password:</label>
                    <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'nascondi password' : 'mostra password'}</button>
                </>
            }
            <button type="submit" disabled={!nickValid}>Entra come guest/accedi/registrati</button>
        </form>
    )
}