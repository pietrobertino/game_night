import { useGlobal } from '../contexts/GlobalContext';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import api from '../api';

export default function NicknameForm() {

    const { accessType } = useGlobal();
    const { user, setUser } = useAuth();

    const [nickname, setNickname] = useState('');
    const [firstNickname, setFirstNickname] = useState('');
    const [showNickMess, setShowNickMessage] = useState(false);

    //variabili per validare l'input del nickname
    const [nickTouched, setNickTouched] = useState(false); //all'inizio il campo input non è toccato
    const nickValid = nickname.trim().length > 3 && nickname.trim().length <= 15;
    const showNickErr = !nickValid && nickTouched;

    // quando user arriva (dopo /me), riempio il campo
    useEffect(() => {
        if (user) {
            setNickname(user.nickname ?? '');
            setFirstNickname(user.nickname);
        };

    }, [user]);

    async function handleForm(e) {
        e.preventDefault();
        //chiamata axios per cambiare il nickname di un utente
        await api.patch('/accounts/changeNickname', { nickname })
            .then(res => {
                setShowNickMessage(true);
                setUser(prev => ({
                    ...prev,
                    nickname // equivale a nickname: nickname
                }));
                setTimeout(() => {
                    setShowNickMessage(false);
                }, 3000)
            })
            .catch(err => console.error(err))
    }

    return (
        <form onSubmit={handleForm}>
            <label htmlFor="nickname">Nickname:</label>
            <input type="text" value={nickname} onChange={e => setNickname(e.target.value)} onBlur={() => setNickTouched(true)} onClick={() => setNickTouched(false)} />
            {showNickErr && <span>Nickname non valido</span>}
            <button disabled={!nickValid || nickname === firstNickname} type='submit'>Cambia nickname</button>
            {showNickMess && <span>Nickname aggiornato!</span>}
        </form>
    )
}