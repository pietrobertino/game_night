import { Link, useLocation, useNavigate } from "react-router-dom"
import logo from "../assets/logo.png"
import { Box, ChevronLeft } from 'react-bootstrap-icons'


export default function AppHeader() {

    const location = useLocation();
    const targetPath = '/lobby';

    //se l'utente è già nella pagina della lobby
    const isAlreadyThere = location.pathname === targetPath;

    //setto la destinazione associata al tasto lobby (o ti rimanda indietro oppure ti porta alla pagina della lobby)
    const destination = isAlreadyThere ? (location.state?.from?.pathname || '/home') : targetPath;

    //dovrei fare in modo che non si possa fare la seguente cosa: SONO in pagina di gioco (e quindi non dovrei andarmene da nessuna parte a parte al massimo visualizzare la lobby) VADO IN LOBBY E POI TORNO ALLA HOME TRAMITE LOGO 

    return (

        <header className="app-header">
            <nav className="app-header__nav">
                <div className="app-header__left">

                    {
                        (location.pathname !== '/home' && !location.pathname.startsWith('/games')) ?
                            <Link to='/home' className="app-header__logo d-flex align-items-center gap-2">
                                <ChevronLeft />
                                <img src={logo} alt="Game Night" />
                            </Link>
                            :
                            <span className="app-header__logo">
                                <img src={logo} alt="Game Night" />
                            </span>
                    }

                </div>
                <Link to={destination} state={isAlreadyThere ? location.state : { from: location }} className="app-header__lobby">
                    <Box />
                    <span>Lobby</span>
                </Link>
            </nav>
        </header>
    )
}
