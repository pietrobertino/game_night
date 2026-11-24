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
import logo from "../assets/logo.png";
import GenericPopup from "../components/GenericPopup";

export default function AccessPage() {

    const { accessType, setInvited } = useAccess();
    const { setLobbyCode, lobbyCode } = useLobby();
    const { user, loading, waiting, setWaiting } = useAuth();
    const { setPopup } = usePopup();

    const { lobbyCodeUrl } = useParams();

    const navigate = useNavigate();

    useEffect(() => {
        // finché /me non ha risposto non so se l'utente è loggato: aspetto
        if (loading) return;

        const handleLobbyEntry = async () => {

            // se l'utente è entrato tramite cookie (user non nullo)
            if (user) {
                // se sono già in una lobby, vengo rimandato alla home
                if (user?.lobby_code) {
                    setPopup('Bro fai già parte di una lobby');
                    navigate('/home');
                    return;
                }

                // già in attesa (es. dopo un ricaricamento): resto qui, non rimando la richiesta
                if (user.admission_status === 'pending') return;

                // se nell'url c'è il codice di una lobby, sono stato invitato
                // se è stato invitato resta qui in attesa di essere accettato
                if (lobbyCodeUrl) {
                    try {
                        await api.post(`/lobbys/${lobbyCodeUrl}/players`);
                        setInvited(true);
                        setLobbyCode(lobbyCodeUrl);
                        setWaiting(true);
                    } catch (err) {
                        if (err.response?.status === 404) {
                            setLobbyCode('');
                            setPopup('La lobby non esiste');
                            navigate('/home');
                        }
                    }
                } else {
                    navigate('/home');
                }
            }
        }
        handleLobbyEntry();
    }, [loading, lobbyCodeUrl, user]);//quando la useeffect ha finito so se user esiste o no (se l'utente entra tramite cookie)

    //Finché la useEffect di AuthContext non ha finito mostro un loader
    if (loading) return <Loader />;



    return (
        <>
            <GenericPopup />
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
                        <AccessForm />
                    </section>
                </main>
            }
        </>
    )

}