import { useGlobal } from "../contexts/GlobalContext";
import WaitingScreen from "../components/WaitingScreen";
import AccessForm from "../components/AccessForm";
import { useParams } from "react-router-dom";
import { useEffect } from "react";

export default function AccessPage() {

    const { accessType, setAccessType, waiting, setInvited } = useGlobal();

    const { lobbyCode } = useParams();

    useEffect(() => {
        //se nell'url tramite cui accedo a questa schermata c'è il codice di una lobby significa che sono stato invitato (però devo validare il lobby code in modo che non si possa semplicemente digitare qualunque cosa)
        if (lobbyCode) setInvited(true);
    })



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