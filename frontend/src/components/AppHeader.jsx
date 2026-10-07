import { Link } from "react-router-dom"

export default function AppHeader() {

    return (
        <header>
            <nav>
                <Link to='/home'>Logo pazzo malato</Link>
                <Link to='/lobby'>Lobby</Link>
            </nav>
        </header>
    )
}