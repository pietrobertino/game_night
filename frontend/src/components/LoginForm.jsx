import { useState } from "react";
import axios from 'axios'

export default function LoginForm() {

    const initialData = { email: '', password: '' }

    const [formData, setFormData] = useState(initialData);
    const [showPassword, setShowPassword] = useState(false);

    const loginUrl = 'http://localhost:3001/accounts';

    function handleForm(e) {
        e.preventDefault();
        axios.post(loginUrl, { mail: formData.email, password: formData.password })
            .then(response => {
                console.log(response.data)
            })
            .catch(err => {
                console.error(err);
            });
        setFormData(initialData);
        //Verifico che l'accesso sia garantito e poi mando il giocatore alla schermata giusta
        //qui dovrei usare la navigazione programmatica per mandare l'utente o alla pagina di attesa (nel caso in sia stato invitato ad una lobby) o alla pagina home
    }

    return (
        <form onSubmit={handleForm}>
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            <label htmlFor="password">Password:</label>
            <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'nascondi password' : 'mostra password'}</button>
            <button type="submit">Accedi</button>
        </form>
    )
}