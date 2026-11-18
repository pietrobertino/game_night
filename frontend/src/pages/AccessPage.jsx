import { useGlobal } from "../contexts/GlobalContext";
import WaitingScreen from "../components/WaitingScreen";
import AccessForm from "../components/AccessForm";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import Loader from "../components/Loader";
import logo from "../assets/logo.png";

export default function AccessPage() {

    const { accessType, setAccessType, waiting, setWaiting, setInvited, setLobbyCode } = useGlobal();
    const { user, loading } = useAuth();

    const { lobbyCode } = useParams();

    const navigate = useNavigate();

    useEffect(() => {
        // finché /me non ha risposto non so se l'utente è loggato: aspetto
        if (loading) return;

        // se nell'url c'è il codice di una lobby, sono stato invitato
        if (lobbyCode) {
            setInvited(true);
            setLobbyCode(lobbyCode);
        }

        // se l'utente è entrato tramite cookie (user non nullo)
        if (user) {
            // se è stato invitato resta qui in attesa di essere accettato
            if (lobbyCode) setWaiting(true);
            // altrimenti va direttamente alla home
            else navigate('/home');
        }
    }, [loading]); //quando la useeffect ha finito so se user esiste o no (se l'utente entra tramite cookie)

    //Finché la useEffect di AuthContext non ha finito mostro un loader
    if (loading) return <Loader />;



    return (
        <>
            {waiting ?

                <WaitingScreen />
                :
                <main className="access-page">
                    <img className="access-page__logo" src={logo} alt="Game Night" />

                    <section className="access-page__card">
                        <h1 className="access-page__title">
                            {accessType === 'guest' && 'Entra come guest'}
                            {accessType === 'login' && "Accedi all'account"}
                            {accessType === 'registration' && 'Creazione account'}
                        </h1>
                        {accessType === 'guest' &&
                            <AccessForm>
                                <button type="button" className="access-form__link" onClick={() => setAccessType('login')}>Ho un account</button>
                                <button type="button" className="access-form__link" onClick={() => setAccessType('registration')}>Crea un account</button>
                            </AccessForm>
                        }
                        {accessType === 'login' &&
                            <AccessForm>
                                <button type="button" className="access-form__link" onClick={() => setAccessType('guest')}>Entra come guest</button>
                                <button type="button" className="access-form__link" onClick={() => setAccessType('registration')}>Crea un account</button>
                            </AccessForm>
                        }
                        {accessType === 'registration' &&
                            <AccessForm>
                                <button type="button" className="access-form__link" onClick={() => setAccessType('login')}>Ho già un account</button>
                                <button type="button" className="access-form__link" onClick={() => setAccessType('guest')}>Entra come guest</button>
                            </AccessForm>
                        }
                    </section>
                </main>
            }
        </>
    )

}