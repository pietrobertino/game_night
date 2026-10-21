import { Link, useLocation } from "react-router-dom"

export default function AppHeader() {

    const location = useLocation();
    const targetPath = '/lobby';

    //se l'utente è già nella pagina della lobby
    const isAlreadyThere = location.pathname === targetPath;

    //setto la destinazione associata al tasto lobby (o ti rimanda indietro oppure ti porta alla pagina della lobby)
    const destination = isAlreadyThere ? (location.state?.from?.pathname || '/home') : targetPath;

    return (
        <header>
            <nav>
                <Link to='/home'>Logo pazzo malato</Link>
                <Link to={destination} state={isAlreadyThere ? location.state : { from: location }}>Lobby</Link>
            </nav>
        </header>
    )
}