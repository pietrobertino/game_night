import { useGlobal } from "../contexts/GlobalContext";
import WaitingScreen from "../components/WaitingScreen";
import AccessForm from "../components/AccessForm";

export default function AccessPage() {

    const { accessType, setAccessType, waiting } = useGlobal();

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