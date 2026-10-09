import { useState } from "react";
import axios from 'axios';

export default function RegistrationForm() {

    const initialData = { email: '', password: '', nickname: '' }

    const [formData, setFormData] = useState(initialData);
    const [showPassword, setShowPassword] = useState(false);

    const registrationUrl = 'http://localhost:3001/accounts/create/registration';

    function handleForm(e) {
        e.preventDefault();
        axios.post(registrationUrl, { mail: formData.email, password: formData.password, nickname: formData.nickname })
            .then(response => {
                console.log(response.data.message)
            })
            .catch(error => {
                console.error(error.response?.data?.message);
            });
        setFormData(initialData);
        //Verifico che la registrazione sia riuscita e poi mando il giocatore alla schermata giusta. Gestire casi in cui la registrazione non va a buon fine (hai già un account, oppure problemi con la mail, il nickname o la passowrd)
        //qui dovrei usare la navigazione programmatica per mandare l'utente o alla pagina di attesa (nel caso in sia stato invitato ad una lobby) o alla pagina home
    }


    return (
        <form onSubmit={handleForm}>
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            <label htmlFor="password">Password:</label>
            <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'nascondi password' : 'mostra password'}</button>
            <label htmlFor="nickname">Nickname:</label>
            <input type="text" id="nickname" name="nickname" value={formData.nickname} onChange={e => setFormData({ ...formData, nickname: e.target.value })} />
            <button type="submit">Registrati</button>
        </form>
    )
}