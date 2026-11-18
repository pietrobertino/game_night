import { useAccess } from "../contexts/AccessContext";
import WaitingScreen from "../components/WaitingScreen";
import AccessForm from "../components/AccessForm";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import Loader from "../components/Loader";
import api from "../api";
import { useLobby } from "../contexts/LobbyContext";
import { usePopup } from "../contexts/PopupContext";

export default function AccessPage() {

    const { accessType, setAccessType, setInvited } = useAccess();
    const { setLobbyCode } = useLobby();
    const { user, loading, waiting, setWaiting } = useAuth();
    const { setPopup } = usePopup();

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
            // già in attesa (es. dopo un ricaricamento): resto qui, non rimando la richiesta
            if (user.admission_status === 'pending') return;

            // se è stato invitato resta qui in attesa di essere accettato
            if (lobbyCode) {
                //invio la richiesta di accesso alla lobby
                api.post(`/lobbys/${lobbyCode}/players`)
                    .then(() => setWaiting(true)) // spostato qui: attesa solo se la richiesta è andata a buon fine
                    .catch(err => {
                        if (err.response?.status === 404) {
                            setLobbyCode('');
                            setPopup('Lobby non trovata');
                            navigate('/lobbys');
                        }
                    });
            }
            // altrimenti va direttamente alla home
            else navigate('/home');
        }
    }, [loading]);//quando la useeffect ha finito so se user esiste o no (se l'utente entra tramite cookie)

    //Finché la useEffect di AuthContext non ha finito mostro un loader
    if (loading) return <Loader />;



    return (
        <>
            {waiting ?

                <WaitingScreen />
                :
                <>
                    {accessType === 'guest' &&
                        <>
                            <AccessForm />
                            <a href="#" onClick={() => setAccessType('login')}>Ho un account</a>
                            <a href="#" onClick={() => setAccessType('registration')}>Crea un account</a>
                        </>
                    }
                    {accessType === 'login' &&
                        <>
                            <AccessForm />
                            <a href="#" onClick={() => setAccessType('guest')}>Entra come guest</a>
                            <a href="#" onClick={() => setAccessType('registration')}>Crea un account</a>
                        </>
                    }
                    {accessType === 'registration' &&
                        <>
                            <AccessForm />
                            <a href="#" onClick={() => setAccessType('login')}>Ho già un account</a>
                            <a href="#" onClick={() => setAccessType('guest')}>Entra come guest</a>
                        </>
                    }
                </>
            }
        </>
    )

}