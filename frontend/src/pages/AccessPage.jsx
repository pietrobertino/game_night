import { useState } from "react"
import GuestForm from "../components/GuestForm";
import RegistrationForm from "../components/RegistrationForm";
import LoginForm from "../components/LoginForm";
import { useGlobal } from "../contexts/GlobalContext";
import WaitingScreen from "../components/WaitingScreen";

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
                            <GuestForm />
                            <a href="#" onClick={() => setAccessType('login')}>Ho un account</a>
                            <a href="#" onClick={() => setAccessType('registration')}>Crea un account</a>
                        </>
                    }
                    {accessType === 'login' &&
                        <>
                            <LoginForm />
                            <a href="#" onClick={() => setAccessType('guest')}>Entra come guest</a>
                            <a href="#" onClick={() => setAccessType('registration')}>Crea un account</a>
                        </>
                    }
                    {accessType === 'registration' &&
                        <>
                            <RegistrationForm />
                            <a href="#" onClick={() => setAccessType('login')}>Ho già un account</a>
                            <a href="#" onClick={() => setAccessType('guest')}>Entra come guest</a>
                        </>
                    }
                </>
            }
        </>
    )

}