import { useNavigate } from 'react-router-dom';
import { useGlobal } from '../contexts/GlobalContext';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import Loader from '../components/Loader';
import NicknameForm from '../components/NicknameForm';
import CancelAccountForm from '../components/CancelAccountForm';

export default function AccountPage() {

    const { setAccessType, lobbyCode, setAYSPopup } = useGlobal();
    const { logout, loading, user } = useAuth();
    const navigate = useNavigate();


    //variabile per mostrare il form della password per eliminare l'account
    const [showPassInput, setShowPassInput] = useState(false);
    const [showMessage, setShowMessage] = useState(false);

    // se /me ha risposto e non c'è nessun utente, torno alla pagina di accesso
    useEffect(() => {
        if (!loading && !user) navigate('/');
    }, [loading, user]);

    async function goToAccount(access) {
        await logout();
        setAccessType(access);
        navigate('/');
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
                        <NicknameForm />
                        <button onClick={() => goToAccount('registration')}>Crea un account</button>
                        <button onClick={() => goToAccount('login')}>Accedi al tuo account</button>
                    </>
                    :

                    <>
                        <NicknameForm />
                        <button onClick={() => setAYSPopup({ show: true, message: 'Sei sicuro di voler uscire dal tuo account?', action: () => goToAccount('guest') })} >Esci dall'account</button>
                        <button onClick={() => setShowPassInput(true)} >Elimina account</button>
                        {showPassInput &&
                            <CancelAccountForm setShowPassInput={setShowPassInput} setShowMessage={setShowMessage} goToAccount={goToAccount} />
                        }
                        {showMessage &&
                            <h5 className=' text-danger'>Account eliminato, adesso verrai reindirizzato alla pagina di accesso</h5>
                        }
                    </>
            }

        </>
    )
}