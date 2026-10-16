import { useNavigate } from 'react-router-dom';
import { useGlobal } from '../contexts/GlobalContext';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import Loader from '../components/Loader';
import api from '../api';

export default function AccountPage() {

    const { accessType, setAccessType, lobbyCode } = useGlobal();
    const { logout, loading, user, setUser } = useAuth();
    const navigate = useNavigate();
    const [nickname, setNickname] = useState('');
    const [showNickMess, setShowNickMessage] = useState(false);

    //variabili per validare l'input del nickname
    const [nickTouched, setNickTouched] = useState(false); //all'inizio il campo input non è toccato
    const nickValid = nickname.trim().length > 3 && nickname.trim().length <= 15;
    const showNickErr = !nickValid && nickTouched;

    //variabile per mostrare l'input della password per eliminare l'account
    const [showPassword, setShowPassword] = useState(false);
    const [showPassInput, setShowPassInput] = useState(false);
    const [password, setPassword] = useState('');
    const [passErr, setPassErr] = useState(false);
    const [showMessage, setShowMessage] = useState(false);

    // quando user arriva (dopo /me), riempio il campo
    useEffect(() => {
        if (user) setNickname(user.nickname ?? '');
    }, [user]);

    // se /me ha risposto e non c'è nessun utente, torno alla pagina di accesso
    useEffect(() => {
        if (!loading && !user) navigate('/');
    }, [loading, user]);



    async function handleForm(e) {
        e.preventDefault();
        //chiamata axios per cambiare il nickname di un utente
        await api.patch('/accounts/changeNickname', { nickname })
            .then(res => {
                setShowNickMessage(true);
                setUser({ id: res.data.id, nickname, account_type: accessType })
                setTimeout(() => {
                    setShowNickMessage(false);
                }, 3000)
            })
            .catch(err => console.error(err))
    }

    async function goToAccount(access) {
        await logout();
        setAccessType(access);
        navigate('/');
    }

    function eliminateAccount(e) {
        e.preventDefault();
        api.post('/accounts/delete', { password })
            .then(res => {
                setShowPassInput(false);
                setShowMessage(true);
                setTimeout(async () => {
                    await logout();
                    setAccessType('guest');
                    navigate('/');
                }, 3000)

            })
            .catch(err => {
                setPassErr(true);
            })
    }

    if (loading) return <Loader />;

    if (!user) return null;

    return (
        <>
            <h1>Account page</h1>
            {lobbyCode ?

                <h2 className='text-danger'>Per accedere alla gestione del profilo non devi far parte di una lobby !</h2>
                :
                user.account_type === 'guest' ?
                    <>
                        <form onSubmit={handleForm}>
                            <label htmlFor="nickname">Nickname:</label>
                            <input type="text" value={nickname} onChange={e => setNickname(e.target.value)} onBlur={() => setNickTouched(true)} onClick={() => setRegErr(false)} />
                            {showNickErr && <span>Nickname non valido</span>}
                            <button disabled={lobbyCode !== '' || !nickValid}>Cambia nickname</button>
                            {showNickMess && <span>Nickname aggiornato!</span>}
                        </form>
                        <button onClick={() => goToAccount('registration')}>Crea un account</button>
                        <button onClick={() => goToAccount('login')}>Accedi al tuo account</button>
                    </>
                    :

                    <>
                        <form onSubmit={handleForm}>
                            <label htmlFor="nickname">Nickname:</label>
                            <input type="text" value={nickname} onChange={e => setNickname(e.target.value)} />
                            <button disabled={lobbyCode !== ''}>Cambia nickname</button>
                            {showNickMess && <span>Nickname aggiornato!</span>}
                        </form>
                        <button onClick={() => goToAccount('guest')} disabled={lobbyCode !== ''}>Esci dall'account</button>
                        <button onClick={() => setShowPassInput(true)} disabled={lobbyCode !== ''}>Elimina account</button>
                        {showMessage &&
                            <h5 className=' text-danger'>Account eliminato, adesso verrai reindirizzato alla pagina di accesso</h5>
                        }
                        {showPassInput &&
                            <form onSubmit={eliminateAccount}>
                                <label htmlFor="password">Password:</label>
                                <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={password} onChange={e => setPassword(e.target.value)} onClick={() => setPassErr(false)} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'nascondi password' : 'mostra password'}</button>
                                <button type='submit' className='btn btn-danger'>Elimina Account</button>
                                <button type='button' className='btn btn-warning' onClick={() => setShowPassInput(false)}>Annulla</button>
                                {passErr &&
                                    <h5 className=' text-danger'>Password errata</h5>
                                }
                            </form>
                        }
                    </>
            }

        </>
    )
}