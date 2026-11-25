import { useState } from 'react';
import api from '../api';
import { usePopup } from '../contexts/PopupContext';

export default function CancelAccountForm({ setShowPassInput, goToAccount }) {

    const { setPopup } = usePopup();

    //variabile per mostrare l'input della password per eliminare l'account
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [passErr, setPassErr] = useState(false);

    function eliminateAccount(e) {
        e.preventDefault();
        api.post('/accounts/delete', { password })
            .then(res => {
                setShowPassInput(false);
                setPopup('Account eliminato, adesso verrai reindirizzato alla pagina di accesso');
                setTimeout(goToAccount('guest'), 3000)

            })
            .catch(err => {
                setPassErr(true);
            })
    }

    return (
        <form onSubmit={eliminateAccount}>
            <h5>Per eliminare l'account inserisci qui la tua password</h5>
            <label htmlFor="password">Password:</label>
            <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={password} onChange={e => setPassword(e.target.value)} onClick={() => setPassErr(false)} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'nascondi password' : 'mostra password'}</button>
            <button type='submit' className='btn btn-danger'>Elimina Account</button>
            <button type='button' className='btn btn-warning' onClick={() => setShowPassInput(false)}>Annulla</button>
            {passErr &&
                <h5 className=' text-danger'>Password errata</h5>
            }
        </form>
    )
}