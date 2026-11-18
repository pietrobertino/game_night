import { Link, useLocation, useNavigate } from "react-router-dom"
import logo from "../assets/logo.png"

// pagine senza freccia indietro: la home e la partita in corso
const noBackPages = ["/home", "/game"]

export default function AppHeader() {

    const location = useLocation();
    const targetPath = '/lobby';

    //se l'utente è già nella pagina della lobby
    const isAlreadyThere = location.pathname === targetPath;

    //setto la destinazione associata al tasto lobby (o ti rimanda indietro oppure ti porta alla pagina della lobby)
    const destination = isAlreadyThere ? (location.state?.from?.pathname || '/home') : targetPath;

    //funzioni di tri
    const { pathname } = useLocation()
    const navigate = useNavigate()

    const showBack = !noBackPages.some(page => pathname.startsWith(page))

    function goBack() {
        // se si è arrivati direttamente da un link non c'è una pagina precedente: si va alla home
        if (window.history.state?.idx > 0) navigate(-1)
        else navigate("/home")
    }

    return (
        // <header>
        //     <nav>
        //         <Link to='/home'>Logo pazzo malato</Link>
        //         <Link to={destination} state={isAlreadyThere ? location.state : { from: location }}>Lobby</Link>

        <header className="app-header">
            <nav className="app-header__nav">
                <div className="app-header__left">
                    {showBack && (
                        <button type="button" className="app-header__back" onClick={goBack} aria-label="Indietro">
                            <i className="bi bi-chevron-left"></i>
                        </button>
                    )}
                    <Link to='/home' className="app-header__logo">
                        <img src={logo} alt="Game Night" />
                    </Link>
                </div>
                <Link to='/lobby' className="app-header__lobby">
                    <i className="bi bi-box"></i>
                    <span>Lobby</span>
                </Link>
            </nav>
        </header>
    )
}
