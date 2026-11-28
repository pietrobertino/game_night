import { useState } from 'react';
import api from '../api';
import { usePopup } from '../contexts/PopupContext';
import { Eye, EyeSlash } from 'react-bootstrap-icons';

export default function CancelAccountForm({ setShowPassInput, goToAccount }) {
    const { setPopup } = usePopup();

    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [passErr, setPassErr] = useState(false);

    function eliminateAccount(e) {
        e.preventDefault();
        api.post('/accounts/delete', { password })
            .then(() => {
                setShowPassInput(false);
                setPopup('Account eliminato, adesso verrai reindirizzato alla pagina di accesso');
                setTimeout(() => goToAccount('guest'), 3000);
            })
            .catch(() => {
                setPassErr(true);
            });
    }

    return (
        <form
            className="delete-account-form"
            onSubmit={eliminateAccount}
            onClick={(e) => e.stopPropagation()}
        >
            <h5 className="delete-account-form__title">
                Per eliminare l&apos;account inserisci qui la tua password
            </h5>

            <label htmlFor="password" className="delete-account-form__label">
                Password:
            </label>

            <div className="delete-account-form__input-group">
                <input type={showPassword ? 'text' : 'password'} id="password" name="password" className={`delete-account-form__input ${passErr ? 'is-invalid' : ''}`} value={password} onChange={(e) => setPassword(e.target.value)} onClick={() => setPassErr(false)} />
                <button type="button" className="delete-account-form__toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Nascondi password' : 'Mostra password'} >
                    {
                        showPassword ? <EyeSlash /> : <Eye />
                    }
                </button>
            </div>

            {passErr && (
                <p className="delete-account-form__error">Password errata</p>
            )}

            <div className="delete-account-form__actions">
                <button type="button" className="btn-pill btn-pill--light" onClick={() => setShowPassInput(false)} >
                    Annulla
                </button>
                <button type="submit" className="btn-pill btn-pill--red">
                    Elimina Account
                </button>
            </div>
        </form>
    );
}