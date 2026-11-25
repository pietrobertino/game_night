import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import api from '../api';

export default function NicknameForm() {

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

        <form onSubmit={handleForm} className="nickname-form mt-4">
            <label htmlFor="nickname" className="nickname-form__label">
                Nickname:
            </label>

            <div className="nickname-form__row">
                <input
                    id="nickname"
                    type="text"
                    className={`nickname-form__input ${showNickErr ? "is-invalid" : ""}`}
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    onBlur={() => setNickTouched(true)}
                    onClick={() => setNickTouched(false)}
                />
                <button
                    type="submit"
                    className="btn-pill btn-pill--green nickname-form__submit"
                    disabled={!nickValid || nickname === firstNickname}
                >
                    Cambia nickname
                </button>
            </div>

            {showNickErr && (
                <span className="nickname-form__error">
                    Nickname non valido: Deve essere di almeno 4 caratteri
                </span>
            )}

            {showNickMess && (
                <span className="nickname-form__success">
                    Nickname aggiornato!
                </span>
            )}
        </form>
    )
}