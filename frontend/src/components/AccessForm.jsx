import { useState } from "react"
import api from "../api";
import { useGlobal } from "../contexts/GlobalContext"
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// children = i link per cambiare tipo di accesso, mostrati di fianco al bottone
export default function AccessForm({ children }) {

    const { invited, setWaiting, accessType, lobbyCode } = useGlobal();
    const { login } = useAuth();
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
    const [emailTouched, setEmailTouched] = useState(false);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailValid = emailRegex.test(formData.email.trim());
    const showEmailErr = emailTouched && !emailValid;

    //variabili per validare password
    const [passTouched, setPassTouched] = useState(false);
    const passValid = formData.password.trim().length >= 8 && formData.password.trim().length <= 25;
    const showPassErr = passTouched && !passValid;

    //messaggi di errore nell'accesso tramite login o registrazione
    const [loginErr, setLoginErr] = useState(false);
    const [regErr, setRegErr] = useState(false);

    //url per le chiamate axios
    const guestUrl = '/accounts/create/guest';
    const loginUrl = '/accounts';
    const registrationUrl = '/accounts/create/registration';

    function handleForm(e) {
        e.preventDefault();
        let notValid;
        let url;
        let data;

        switch (accessType) {
            case 'guest':
                notValid = !nickValid;
                url = guestUrl;
                data = { nickname: nickname };
                break;

            case 'login':
                notValid = !emailValid || !passValid;
                url = loginUrl;
                data = { mail: formData.email, password: formData.password };
                break;

            case 'registration':

                notValid = !emailValid || !passValid || !nickValid;
                url = registrationUrl;
                data = { mail: formData.email, password: formData.password, nickname: nickname };
                break;
        }

        if (notValid) return;
        api.post(url, data)
            .then(response => {
                console.log(response.data.message);
                // salvo l'utente e collego il socket (il cookie ora esiste)
                login({ id: response.data.id, nickname: response.data.nickname, account_type: accessType });

                //se l'utente è stato invitato ad una lobby (non sta accedendo direttamente al sito)
                if (invited) {
                    //invio la richiesta di accesso alla lobby
                    api.post(`/lobbys/${lobbyCode}/players`)
                        .then(res => {
                            console.log(res.data.message)
                            //viene mandato alla pagina di accesso con la schermata di attesa
                        })
                        .catch(err => console.error(err.response?.data?.message))
                    setWaiting(true);
                    navigate('/');
                } else {
                    //altrimenti viene mandato alla home
                    navigate('/home');
                };
            })
            .catch(err => {
                console.error(err.response?.data?.message);
                if (accessType === 'login') setLoginErr(true);
                else if (accessType === 'registration') setRegErr(true);
            });
    }

    return (
        <form className="access-form" onSubmit={handleForm}>
            {
                (accessType === 'guest' || accessType === 'registration') &&
                <div className="access-form__field">
                    <label htmlFor="nickname" className="visually-hidden">Nickname:</label>
                    <input type="text" id="nickname" className="access-form__input" placeholder="Nickname" value={nickname} onChange={e => setNickname(e.target.value)} onBlur={() => setNickTouched(true)} onClick={() => setRegErr(false)} />
                    {showNickErr && <span className="access-form__error">Nickname non valido</span>}
                </div>
            }
            {
                (accessType === 'login' || accessType === 'registration') &&
                <>
                    <div className="access-form__field">
                        <label htmlFor="email" className="visually-hidden">Email:</label>
                        <input type="text" id="email" name="email" className="access-form__input" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} onBlur={() => setEmailTouched(true)} onClick={() => { setLoginErr(false); setRegErr(false) }} />
                        {showEmailErr && <span className="access-form__error">Email non valida</span>}
                    </div>
                    <div className="access-form__field">
                        <label htmlFor="password" className="visually-hidden">Password:</label>
                        <div className="access-form__password">
                            <input type={showPassword ? 'text' : 'password'} id="password" name="password" className="access-form__input" placeholder="Password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} onBlur={() => setPassTouched(true)} onClick={() => { setLoginErr(false); setRegErr(false) }} />
                            <button type="button" className="access-form__eye" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'nascondi password' : 'mostra password'}>
                                <i className={showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'}></i>
                            </button>
                        </div>
                        {showPassErr && <span className="access-form__error">Password non valida</span>}
                    </div>
                </>
            }

            {loginErr && <span className="access-form__error">Email e/o Password errata</span>}
            {regErr && <span className="access-form__error">Esiste già un account registrato con questo indirizzo email</span>}

            <div className="access-form__actions">
                <div className="access-form__links">{children}</div>
                <button type="submit" className="btn-pill btn-pill--orange access-form__submit" disabled={((accessType === 'guest' || accessType === 'registration') && !nickValid) || ((accessType === 'login' || accessType === 'registration') && (!emailValid || !passValid))}>
                    {accessType === 'guest' && 'Entra'}
                    {accessType === 'login' && 'Accedi'}
                    {accessType === 'registration' && 'Registrati'}
                </button>
            </div>
        </form>
    )
}